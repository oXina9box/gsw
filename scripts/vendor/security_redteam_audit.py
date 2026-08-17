#!/usr/bin/env python3
"""Authorized repository security audit tool.

This tool performs non-destructive, local static analysis. It never exploits a
finding, contacts arbitrary hosts, brute-forces credentials, or changes the
target repository.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Optional


SEVERITIES = ("critical", "high", "medium", "low", "info")
SEVERITY_RANK = {name: index for index, name in enumerate(SEVERITIES)}
DEFAULT_IGNORED_DIRS = {
    ".git", ".hg", ".svn", "node_modules", "vendor", "venv", ".venv",
    "__pycache__", ".mypy_cache", ".pytest_cache", "dist", "build", "coverage",
}
MAX_FILE_BYTES = 2_000_000
TEXT_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".java", ".go",
    ".rb", ".php", ".rs", ".cs", ".c", ".h", ".cpp", ".swift", ".kt",
    ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".conf", ".env",
    ".txt", ".md", ".xml", ".html", ".htm", ".sql", ".sh", ".bash",
    ".dockerfile",
}


@dataclass(frozen=True)
class Finding:
    id: str
    severity: str
    confidence: str
    category: str
    title: str
    file: str
    line: int
    evidence: str
    impact: str
    remediation: str
    fix_steps: tuple[str, ...]
    verification: tuple[str, ...]
    prevention: tuple[str, ...]

    def fingerprint(self) -> str:
        raw = f"{self.id}|{self.file}|{self.line}|{self.evidence}".encode()
        return hashlib.sha256(raw).hexdigest()[:16]


@dataclass
class AuditResult:
    target: str
    mode: str
    generated_at: str
    files_scanned: int
    findings: list[Finding]
    skipped_files: list[str]

    def counts(self) -> dict[str, int]:
        return {severity: sum(f.severity == severity for f in self.findings) for severity in SEVERITIES}


@dataclass(frozen=True)
class TextFile:
    path: str
    text: str


REMEDIATION_GUIDANCE: dict[str, dict[str, tuple[str, ...]]] = {
    "SEC001": {
        "fix_steps": ("Treat the key as compromised immediately.", "Revoke it at the issuing provider and issue a replacement with least privilege.", "Remove it from the working tree and repository history using your approved history-cleanup process."),
        "verification": ("Confirm the old key is rejected by the provider.", "Run a secret scanner against the current tree and repository history."),
        "prevention": ("Inject secrets at runtime from a secret manager.", "Enable pre-commit and CI secret scanning with push protection."),
    },
    "SEC002": {
        "fix_steps": ("Revoke the AWS access key and inspect its audit-log activity.", "Create a short-lived role or replacement key with only required permissions.", "Remove the identifier and any paired secret from the tree and history."),
        "verification": ("Check cloud audit logs for unexpected use.", "Verify the revoked key cannot authenticate and the replacement passes least-privilege tests."),
        "prevention": ("Prefer workload identity or short-lived role credentials.", "Alert on new long-lived access keys and excessive permission grants."),
    },
    "SEC003": {
        "fix_steps": ("Revoke the GitHub token and review repository/org audit logs.", "Issue a fine-grained token scoped to the smallest required resources.", "Remove the token from source and approved history-cleanup targets."),
        "verification": ("Confirm the old token is invalid.", "Check that the replacement cannot access unrelated repositories or administration APIs."),
        "prevention": ("Use GitHub Actions/OIDC or an external secret manager instead of stored personal tokens.", "Require secret scanning and token-expiration policies."),
    },
    "SEC005": {
        "fix_steps": ("Revoke or rotate the value even if it is only in a private repository.", "Replace the literal with an environment/secret-manager reference.", "Add the filename pattern to ignore rules and remove it from repository history when appropriate."),
        "verification": ("Run the application with a test-injected secret.", "Search both the tree and history for the old value or a distinctive fragment."),
        "prevention": ("Use secret scanning on commits and pull requests.", "Use separate credentials per environment and rotate them automatically."),
    },
    "CODE003": {
        "fix_steps": ("Replace shell execution with an argument array and shell=False.", "Validate inputs against a strict allowlist before invoking the process.", "Apply a timeout, resource limits, and a dedicated low-privilege service account."),
        "verification": ("Test metacharacters, whitespace, and unexpected encodings as hostile input.", "Confirm process arguments are not interpreted by a shell."),
        "prevention": ("Add command-injection regression tests and a static rule to CI.", "Keep privileged operations behind a narrow service boundary."),
    },
    "CODE005": {
        "fix_steps": ("Replace unsafe YAML loading with a safe loader.", "Reject unknown object tags and validate the resulting data against a schema."),
        "verification": ("Test malicious tags and confirm no constructors or side effects run.", "Run the parser under a least-privilege test account."),
        "prevention": ("Treat configuration as untrusted input and pin the YAML library.", "Keep deserialization tests in CI."),
    },
    "CODE006": {
        "fix_steps": ("Stop deserializing untrusted pickle bytes.", "Migrate to JSON or another typed format with explicit schemas.", "Invalidate any persisted payloads created before the change if their trust boundary is unclear."),
        "verification": ("Confirm untrusted payloads are rejected without object construction.", "Review storage, queues, and cache entries for attacker-controlled bytes."),
        "prevention": ("Document trusted data boundaries and prohibit unsafe deserialization in CI.", "Use signed, versioned data where authenticity is required."),
    },
    "CODE008": {
        "fix_steps": ("Remove the raw HTML sink where possible.", "If rich HTML is required, sanitize with a maintained allowlist immediately before rendering.", "Apply output encoding appropriate to the HTML, attribute, URL, or script context."),
        "verification": ("Test stored, reflected, and DOM-based payloads in an approved staging environment.", "Confirm CSP and framework escaping remain active."),
        "prevention": ("Add XSS regression tests and a trusted-types/CSP policy where supported.", "Review every new raw HTML sink in code review."),
    },
    "WEB001": {
        "fix_steps": ("Replace `*` with an explicit production origin allowlist.", "Reject credentialed requests from untrusted origins and validate the Origin header server-side."),
        "verification": ("Test allowed and disallowed origins, preflight behavior, and credentialed requests.", "Confirm sensitive responses never contain wildcard CORS headers."),
        "prevention": ("Keep allowed origins in reviewed deployment configuration.", "Add automated CORS tests for every authenticated endpoint."),
    },
    "WEB002": {
        "fix_steps": ("Disable debug/development mode in public deployments.", "Move the setting to an environment-specific, fail-closed production configuration.", "Review logs and error responses for secrets or internal details exposed while it was enabled."),
        "verification": ("Request invalid routes and confirm generic errors without stack traces or debug consoles.", "Assert production startup fails closed when the environment is ambiguous."),
        "prevention": ("Add a deployment smoke test that rejects debug mode.", "Use separate development and production configuration schemas."),
    },
    "WEB004": {
        "fix_steps": ("Change external service URLs to HTTPS and re-enable certificate verification.", "Rotate credentials sent over the unsafe connection if exposure is possible.", "Allow HTTP only for explicitly local, non-sensitive development endpoints."),
        "verification": ("Inspect outbound requests and confirm TLS validation is enabled.", "Test certificate failure handling and redirect behavior."),
        "prevention": ("Enforce HTTPS through configuration validation and egress policy.", "Monitor certificate expiry and downgrade attempts."),
    },
    "CONT002": {
        "fix_steps": ("Remove secrets from ENV/ARG and rebuild the image.", "Rotate every value that may have entered image layers or build logs.", "Use runtime secret injection or a build secret mount."),
        "verification": ("Inspect image history and exported layers for the old value.", "Build from a clean context and confirm the application receives the secret only at runtime."),
        "prevention": ("Block secret-like Dockerfile instructions in CI.", "Use short-lived build credentials and scoped registry permissions."),
    },
    "CONT003": {
        "fix_steps": ("Create a dedicated unprivileged user/group in the image.", "Set an explicit USER and make only required paths writable."),
        "verification": ("Run the container and assert its UID is non-root.", "Exercise the app with a read-only root filesystem where feasible."),
        "prevention": ("Enforce non-root and read-only container policies in admission control.", "Scan built images before publication."),
    },
    "IAC001": {
        "fix_steps": ("Remove privileged or host-namespace access.", "Set a restrictive security context with non-root UID, dropped capabilities, and no privilege escalation."),
        "verification": ("Validate manifests with a policy scanner and deploy to a disposable namespace.", "Confirm the workload cannot read host namespaces or devices."),
        "prevention": ("Enforce Pod Security Standards/admission policies.", "Review any exception with an owner, expiry, and compensating control."),
    },
    "CI001": {
        "fix_steps": ("Do not checkout or execute untrusted pull-request code in a privileged workflow.", "Move untrusted builds to `pull_request` and isolate privileged release jobs.", "Restrict permissions and secrets at job scope."),
        "verification": ("Open a test pull request and confirm it cannot access deployment secrets or write tokens.", "Review workflow logs for untrusted code execution paths."),
        "prevention": ("Require workflow security review and least-privilege permissions.", "Pin third-party actions to reviewed commit SHAs."),
    },
    "CI002": {
        "fix_steps": ("Replace mutable action tags with reviewed full commit SHAs.", "Record the action version and review updates as code changes."),
        "verification": ("Check every workflow `uses:` reference resolves to a 40-character commit SHA.", "Review the pinned commit's provenance and permissions."),
        "prevention": ("Enforce action pinning with a CI policy rule.", "Update pinned actions on a scheduled, reviewed cadence."),
    },
    "DEP001": {
        "fix_steps": ("Select a reviewed, supported dependency version.", "Generate and commit the ecosystem lockfile where appropriate.", "Review the dependency's advisories, permissions, and transitive tree."),
        "verification": ("Run the native package-manager audit and the test suite from a clean checkout.", "Confirm repeatable installs produce the reviewed lockfile."),
        "prevention": ("Use automated dependency update PRs with security checks.", "Reject unbounded versions in manifests and review transitive changes."),
    },
}


class Auditor:
    def __init__(self, root: Path, mode: str = "local") -> None:
        self.root = root.resolve()
        self.mode = mode
        self.findings: list[Finding] = []
        self.skipped: list[str] = []
        self.files: list[TextFile] = []

    def run(self) -> AuditResult:
        self._load_files()
        self._check_secrets()
        self._check_code_sinks()
        self._check_application_boundaries()
        self._check_web_config()
        self._check_containers_and_iac()
        self._check_ci()
        self._check_repository_hygiene()
        self._check_dependency_manifests()
        self._check_public_posture()
        # Stable output makes reports diffable in CI.
        unique = {finding.fingerprint(): finding for finding in self.findings}
        findings = sorted(
            unique.values(),
            key=lambda f: (SEVERITY_RANK[f.severity], f.file, f.line, f.id),
        )
        return AuditResult(
            target=str(self.root),
            mode=self.mode,
            generated_at=datetime.now(timezone.utc).isoformat(),
            files_scanned=len(self.files),
            findings=findings,
            skipped_files=sorted(self.skipped),
        )

    def _load_files(self) -> None:
        if not self.root.is_dir():
            raise ValueError(f"Target is not a directory: {self.root}")
        for path in sorted(self.root.rglob("*")):
            if not path.is_file() or any(part in DEFAULT_IGNORED_DIRS for part in path.parts):
                continue
            try:
                if path.stat().st_size > MAX_FILE_BYTES:
                    self.skipped.append(self._relative(path) + " (over 2 MB)")
                    continue
                raw = path.read_bytes()
                if b"\x00" in raw:
                    self.skipped.append(self._relative(path) + " (binary)")
                    continue
                text = raw.decode("utf-8")
            except (OSError, UnicodeDecodeError):
                self.skipped.append(self._relative(path) + " (unreadable or non-UTF-8)")
                continue
            self.files.append(TextFile(self._relative(path), text))

    def _relative(self, path: Path) -> str:
        return path.relative_to(self.root).as_posix()

    def _add(self, *, id: str, severity: str, confidence: str, category: str,
             title: str, file: str, line: int, evidence: str, impact: str,
             remediation: str) -> None:
        guidance = REMEDIATION_GUIDANCE.get(id, {
            "fix_steps": (remediation, "Trace the affected value from its source to every use and remove the unsafe behavior at the trust boundary."),
            "verification": ("Re-run this audit after the change.", "Add a regression test proving the unsafe input or configuration is rejected."),
            "prevention": ("Add a CI policy or test that prevents the same pattern from returning.", "Document the secure default and owner for this control."),
        })
        self.findings.append(Finding(
            id=id, severity=severity, confidence=confidence, category=category,
            title=title, file=file, line=line, evidence=evidence[:300].strip(),
            impact=impact, remediation=remediation,
            fix_steps=guidance["fix_steps"], verification=guidance["verification"],
            prevention=guidance["prevention"],
        ))

    def _line_matches(self, pattern: str, flags: int = re.IGNORECASE) -> Iterable[tuple[TextFile, int, str]]:
        compiled = re.compile(pattern, flags)
        for source in self.files:
            for number, line in enumerate(source.text.splitlines(), 1):
                if compiled.search(line):
                    yield source, number, line

    def _check_secrets(self) -> None:
        secret_patterns: list[tuple[str, str, str, str]] = [
            ("SEC001", r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----", "Private key material", "Remove it, revoke/rotate it, and load it from a secret manager."),
            ("SEC002", r"\bAKIA[0-9A-Z]{16}\b", "AWS access key identifier", "Revoke the key and replace it with short-lived, least-privileged credentials."),
            ("SEC003", r"\bgh[pousr]_[A-Za-z0-9_]{30,}\b", "GitHub token", "Revoke the token and use an environment-backed secret."),
            ("SEC004", r"\b(?:xox[baprs]-|sk_live_|rk_live_)[A-Za-z0-9_-]{12,}\b", "Service API token", "Revoke/rotate the token and keep it outside source control."),
            ("SEC005", r"(?i)\b(?:password|passwd|secret|api[_-]?key|access[_-]?token)\b\s*[:=]\s*[\"'][^\"']{8,}[\"']", "Hard-coded credential-like value", "Move the value to an injected secret and add the file to ignore rules."),
            ("SEC006", r"(?i)\b(?:postgres|mysql|mongodb(?:\+srv)?|redis)://[^\s\"']+:[^\s\"']+@", "Credential embedded in connection URL", "Rotate the credential and construct the connection string from secret references."),
        ]
        for finding_id, pattern, title, remediation in secret_patterns:
            for source, line_number, line in self._line_matches(pattern):
                self._add(
                    id=finding_id, severity="critical" if finding_id in {"SEC001", "SEC002", "SEC003"} else "high",
                    confidence="high", category="secrets", title=title, file=source.path,
                    line=line_number, evidence=line, impact="An attacker who obtains the repository may impersonate the service or access protected data.",
                    remediation=remediation,
                )

    def _check_code_sinks(self) -> None:
        checks: list[tuple[str, str, str, str, str, str]] = [
            ("CODE001", r"\beval\s*\(", "Dynamic code evaluation", "high", "Avoid evaluating attacker-controlled strings; use a parser or an allowlisted operation.", "An attacker may execute arbitrary code if input reaches this sink."),
            ("CODE002", r"\bexec\s*\(", "Dynamic code execution", "high", "Remove dynamic execution or strictly isolate and allowlist the operation.", "Untrusted input reaching this sink can lead to arbitrary code execution."),
            ("CODE003", r"subprocess\.[A-Za-z_]+\([^\n]*shell\s*=\s*True", "Shell command with shell=True", "high", "Pass an argument list with shell=False and validate each argument.", "Shell metacharacters can turn input into arbitrary command execution."),
            ("CODE004", r"\bos\.system\s*\(", "Operating-system command execution", "high", "Use a fixed argument list and avoid passing user-controlled strings to a shell.", "Command injection is possible when data is concatenated into the command."),
            ("CODE005", r"\byaml\.load\s*\(", "Unsafe YAML deserialization candidate", "high", "Use yaml.safe_load or an explicit safe loader for untrusted YAML.", "Some YAML loaders can instantiate objects and execute code during deserialization."),
            ("CODE006", r"\bpickle\.(?:load|loads)\s*\(", "Unsafe pickle deserialization candidate", "critical", "Do not deserialize untrusted pickle data; use a safe, typed interchange format.", "Pickle payloads can execute code during deserialization."),
            ("CODE007", r"child_process\.(?:exec|execSync)\s*\(", "Node shell command execution", "high", "Prefer execFile/spawn with an argument array and validate input.", "Shell interpretation can enable command injection."),
            ("CODE008", r"\b(?:dangerouslySetInnerHTML|innerHTML\s*=)", "Raw HTML injection sink", "medium", "Use framework escaping and sanitize any intentionally-rendered HTML with a maintained allowlist.", "Attacker-controlled markup can become stored or reflected XSS."),
            ("CODE009", r"(?i)(?:SELECT|INSERT|UPDATE|DELETE)\b[^\n]*(?:\+|%\s*[sdf]|\.format\(|f[\"'])", "Potential SQL string construction", "high", "Use parameterized queries or the ORM's bind-parameter API.", "String-built SQL can allow authentication bypass or data exfiltration."),
        ]
        extensions = {".py", ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".rb", ".php", ".java", ".go", ".rs"}
        for source, number, line in self._line_matches(r".+"):
            if Path(source.path).suffix.lower() not in extensions:
                continue
            for finding_id, pattern, title, severity, remediation, impact in checks:
                if re.search(pattern, line, re.IGNORECASE):
                    self._add(id=finding_id, severity=severity, confidence="medium", category="code", title=title,
                              file=source.path, line=number, evidence=line, impact=impact, remediation=remediation)

    def _check_application_boundaries(self) -> None:
        code_extensions = {".py", ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".rb", ".php", ".java", ".go", ".rs"}
        checks: list[tuple[str, str, str, str, str, str]] = [
            ("APP001", r"(?:open|readFile|readFileSync|send_file|sendFile)\s*\([^\n]*(?:request\.|req\.|params|query|user_input|input)", "User-controlled path reaches file access", "high", "Canonicalize the path, reject traversal, and enforce an allowlisted base directory before opening or sending files.", "Path traversal can expose source, credentials, or host files."),
            ("APP002", r"(?:requests\.(?:get|post|put|delete)|urllib\.request\.urlopen|fetch|axios\.(?:get|post|request))\s*\([^\n]*(?:request\.|req\.|params|query|user_input|input|url)", "Potential server-side request forgery sink", "high", "Parse and validate the destination against an explicit scheme/host allowlist; block private, loopback, link-local, and metadata IP ranges after DNS resolution.", "An attacker may make the server access internal services or cloud metadata."),
            ("APP003", r"(?:hashlib\.)?(?:md5|sha1)\s*\(", "Weak cryptographic hash", "medium", "Use SHA-256 or a modern password-hashing function such as Argon2id/bcrypt for passwords.", "Collision-prone hashes can weaken integrity checks and password protection."),
            ("APP004", r"(?i)(?:jwt\.(?:decode|verify)|verify)\s*\([^\n]*(?:verify[_-]?signature|verification)\s*=\s*False", "Signature verification disabled", "critical", "Require algorithm allowlisting, issuer/audience validation, expiry checks, and signature verification.", "Forged tokens may be accepted as authenticated identities."),
            ("APP005", r"(?i)(?:random\.random|Math\.random)\s*\([^\n]*\)|(?:session|csrf|reset|token|secret)[A-Za-z_]*\s*=\s*(?:random\.|Math\.random)", "Non-cryptographic randomness used for security material", "high", "Use a CSPRNG such as secrets.token_urlsafe or crypto.randomBytes for tokens, resets, and CSRF values.", "Predictable tokens can enable account takeover or request forgery."),
            ("APP006", r"(?i)(?:logger(?:\.[A-Za-z_]+)?|logging|console\.(?:log|info|error)|print)\s*\([^\n]*(?:password|passwd|secret|token|authorization|api[_-]?key)", "Potential secret exposure in logs", "high", "Remove secret values from logs, redact structured fields, and rotate any value already emitted.", "Logs often have broad retention and access, turning diagnostics into credential disclosure."),
        ]
        for source, number, line in self._line_matches(r".+"):
            if Path(source.path).suffix.lower() not in code_extensions:
                continue
            for finding_id, pattern, title, severity, remediation, impact in checks:
                if re.search(pattern, line, re.IGNORECASE):
                    self._add(id=finding_id, severity=severity, confidence="medium", category="application", title=title,
                              file=source.path, line=number, evidence=line, impact=impact, remediation=remediation)

    def _check_web_config(self) -> None:
        for source, number, line in self._line_matches(r"(?:CORS|Access-Control-Allow-Origin|allow_origins|cors)\s*[^\n]*\*"):
            self._add(id="WEB001", severity="medium", confidence="medium", category="web-config",
                      title="Wildcard cross-origin access", file=source.path, line=number, evidence=line,
                      impact="Any website may be allowed to make cross-origin requests; this is especially dangerous alongside credentials or sensitive endpoints.",
                      remediation="Use an explicit origin allowlist and never combine wildcard origins with credentials.")
        for source, number, line in self._line_matches(r"(?i)(?:debug\s*[:=]\s*true|app\.run\([^\n]*debug\s*=\s*True|NODE_ENV\s*[:=]\s*[\"']development)"):
            self._add(id="WEB002", severity="high" if self.mode == "public" else "medium", confidence="high", category="web-config",
                      title="Development/debug mode enabled", file=source.path, line=number, evidence=line,
                      impact="Verbose errors, debug consoles, or development behavior may expose secrets and internal details.",
                      remediation="Disable debug/development mode in production and set it only through a controlled deployment configuration.")
        for source, number, line in self._line_matches(r"(?i)(?:bind|host|listen)\s*[:=]\s*[\"']?0\.0\.0\.0"):
            self._add(id="WEB003", severity="medium" if self.mode == "public" else "low", confidence="medium", category="exposure",
                      title="Service configured to bind all interfaces", file=source.path, line=number, evidence=line,
                      impact="The service may be reachable from unintended network interfaces or exposed container networks.",
                      remediation="Bind to the required interface only and enforce access with network policy, authentication, and TLS.")
        for source, number, line in self._line_matches(r"(?i)(?:http://|verify\s*=\s*False|ssl_verify\s*[:=]\s*false)"):
            if "localhost" not in line.lower() and "127.0.0.1" not in line:
                self._add(id="WEB004", severity="medium", confidence="medium", category="transport",
                          title="Cleartext transport or TLS verification disabled", file=source.path, line=number, evidence=line,
                          impact="Credentials and sensitive data may be intercepted or the peer may be impersonated.",
                          remediation="Use HTTPS/TLS and keep certificate verification enabled; allow cleartext only for explicitly local development paths.")

    def _check_containers_and_iac(self) -> None:
        for source in self.files:
            name = Path(source.path).name.lower()
            is_docker = name == "dockerfile" or name.startswith("dockerfile.")
            if is_docker:
                for number, line in enumerate(source.text.splitlines(), 1):
                    if re.search(r"^\s*FROM\s+[^\n:]+:latest\s*$", line, re.IGNORECASE):
                        self._add(id="CONT001", severity="medium", confidence="high", category="container", title="Container uses mutable latest tag", file=source.path, line=number, evidence=line,
                                  impact="Builds can silently change and receive unreviewed code or vulnerable dependencies.", remediation="Pin images to a reviewed immutable version or digest.")
                    if re.search(r"^\s*(?:ENV|ARG)\s+[^\n]*(?:PASSWORD|SECRET|TOKEN|API_KEY)\s*=", line, re.IGNORECASE):
                        self._add(id="CONT002", severity="high", confidence="high", category="secrets", title="Secret-like value passed to image build", file=source.path, line=number, evidence=line,
                                  impact="Build arguments and image layers can expose credentials to image users and registries.", remediation="Use runtime secret injection and BuildKit secret mounts; rotate any exposed value.")
                if not re.search(r"(?im)^\s*USER\s+[^\s]+", source.text):
                    self._add(id="CONT003", severity="medium", confidence="high", category="container", title="Container has no non-root USER directive", file=source.path, line=1, evidence="No USER directive found", impact="A container compromise may provide root privileges inside the container and increase escape impact.", remediation="Create a dedicated unprivileged user and run the application as that user.")
            if name.endswith((".yaml", ".yml", ".json")) or "k8s" in source.path.lower() or "kubernetes" in source.path.lower():
                for number, line in enumerate(source.text.splitlines(), 1):
                    if re.search(r"(?i)privileged\s*:\s*true|hostNetwork\s*:\s*true|hostPID\s*:\s*true", line):
                        self._add(id="IAC001", severity="critical" if "privileged" in line.lower() else "high", confidence="high", category="iac", title="Elevated container or host namespace access", file=source.path, line=number, evidence=line, impact="A compromised workload may access host resources or other workloads.", remediation="Remove the privilege/host namespace setting and enforce a restrictive pod security profile.")
                    if re.search(r"(?i)\bhostPath\s*:", line):
                        self._add(id="IAC002", severity="high", confidence="medium", category="iac", title="Kubernetes hostPath volume", file=source.path, line=number, evidence=line, impact="Host filesystem access can expose credentials or enable host tampering.", remediation="Prefer a managed volume and use read-only mounts with the smallest required path when hostPath is unavoidable.")
                    if re.search(r"(?i)(?:0\.0\.0\.0/0|::/0)", line):
                        self._add(id="IAC003", severity="high" if self.mode == "public" else "medium", confidence="high", category="iac", title="Network rule allows traffic from the entire internet", file=source.path, line=number, evidence=line, impact="A service or management port may be reachable by any internet host.", remediation="Restrict ingress to named networks or identity-aware access and remove public management ports.")
                    if re.search(r"(?i)allowPrivilegeEscalation\s*:\s*true|runAsUser\s*:\s*0|readOnlyRootFilesystem\s*:\s*false", line):
                        self._add(id="IAC004", severity="high", confidence="high", category="iac", title="Workload security context weakens isolation", file=source.path, line=number, evidence=line, impact="A compromised process may gain additional privileges or persist changes in the container filesystem.", remediation="Set allowPrivilegeEscalation=false, run as a non-root UID, drop capabilities, and use a read-only root filesystem.")
                    if re.search(r"(?i)(?:acl|access_control)\s*:\s*[\"']?public-read|publicAccess\s*:\s*true", line):
                        self._add(id="IAC005", severity="high", confidence="medium", category="iac", title="Storage resource is publicly readable", file=source.path, line=number, evidence=line, impact="Data may be downloadable without authentication.", remediation="Disable public access, require authenticated access, and review object-level permissions and access logs.")

    def _check_public_posture(self) -> None:
        if self.mode != "public":
            return
        web_extensions = {".py", ".js", ".jsx", ".ts", ".tsx", ".rb", ".php", ".java", ".go"}
        web_like = [source for source in self.files if Path(source.path).suffix.lower() in web_extensions and re.search(r"(?:flask|django|fastapi|express|koa|rails|spring|gin|http|router|route)", source.text, re.IGNORECASE)]
        if web_like and not any(re.search(r"(?i)(?:content-security-policy|strict-transport-security|x-content-type-options|frame-ancestors)", source.text) for source in self.files):
            self._add(id="POSTURE001", severity="medium", confidence="low", category="public-release", title="No explicit browser security headers detected", file=".", line=1, evidence="No CSP, HSTS, X-Content-Type-Options, or frame-ancestors configuration found", impact="Browser-facing defenses may be absent if they are not supplied by the reverse proxy or platform.", remediation="Set a deliberate header policy at the application or trusted edge: CSP, HSTS after HTTPS is proven, X-Content-Type-Options, Referrer-Policy, and frame-ancestors.")

    def _check_ci(self) -> None:
        for source, number, line in self._line_matches(r"pull_request_target"):
            self._add(id="CI001", severity="high", confidence="medium", category="ci-cd", title="Privileged pull_request_target workflow", file=source.path, line=number, evidence=line, impact="Untrusted pull request content can gain access to privileged workflow context if checked out or executed.", remediation="Avoid checking out or executing PR code in this event; use pull_request for untrusted builds and isolate privileged jobs.")
        for source, number, line in self._line_matches(r"(?i)uses:\s*[^\s]+@(?:main|master|dev|latest)"):
            self._add(id="CI002", severity="medium", confidence="high", category="ci-cd", title="CI action is not pinned", file=source.path, line=number, evidence=line, impact="A mutable action reference can change to malicious code without a repository change.", remediation="Pin third-party actions to a reviewed commit SHA and update deliberately.")
        for source, number, line in self._line_matches(r"(?i)run:\s*[^\n]*(?:echo|printf)[^\n]*(?:secret|token|password|key)"):
            self._add(id="CI003", severity="high", confidence="medium", category="ci-cd", title="Potential secret exposure in CI output", file=source.path, line=number, evidence=line, impact="Credentials may be printed into build logs or forwarded to other systems.", remediation="Do not print secrets; mask values and pass them only to the process that needs them.")
        workflow_files = [source for source in self.files if source.path.startswith(".github/workflows/") and Path(source.path).suffix.lower() in {".yml", ".yaml"}]
        for source in workflow_files:
            if not re.search(r"(?im)^\s*permissions\s*:", source.text):
                self._add(id="CI004", severity="medium", confidence="medium", category="ci-cd", title="Workflow does not declare least-privilege permissions", file=source.path, line=1, evidence="No top-level or job-level permissions block found", impact="The workflow may inherit broader repository token permissions than it needs.", remediation="Declare permissions explicitly, default to contents: read, and grant write/id-token access only to the specific job that requires it.")

    def _check_repository_hygiene(self) -> None:
        names = {source.path for source in self.files}
        if any(Path(name).name in {".env", ".env.local", ".env.production", "credentials.json", "service-account.json"} for name in names):
            for name in sorted(names):
                if Path(name).name in {".env", ".env.local", ".env.production", "credentials.json", "service-account.json"}:
                    self._add(id="REPO001", severity="high", confidence="high", category="hygiene", title="Sensitive configuration file is present", file=name, line=1, evidence=Path(name).name, impact="Sensitive configuration can be accidentally committed, copied, or published with the application.", remediation="Remove it from version control, rotate contained values, and commit a sanitized example plus ignore rule.")
        if ".gitignore" not in names:
            self._add(id="REPO002", severity="low", confidence="high", category="hygiene", title="No .gitignore found", file=".", line=1, evidence=".gitignore is absent", impact="Local secrets, build output, and credentials are more likely to be committed accidentally.", remediation="Add ignore rules for environment files, credentials, build output, caches, and local tooling artifacts.")
        for source, number, line in self._line_matches(r"(?i)chmod\s+0?777|permissions?\s*[:=]\s*[\"']?777"):
            self._add(id="REPO003", severity="medium", confidence="high", category="permissions", title="World-writable permission setting", file=source.path, line=number, evidence=line, impact="Other local users or processes may tamper with executable or sensitive files.", remediation="Use least-privilege permissions, normally 750/640 or stricter where appropriate.")

    def _check_dependency_manifests(self) -> None:
        for source in self.files:
            basename = Path(source.path).name.lower()
            if basename in {"package.json", "requirements.txt", "pipfile", "pyproject.toml", "go.mod", "cargo.toml", "pom.xml", "build.gradle"}:
                for number, line in enumerate(source.text.splitlines(), 1):
                    if re.search(r"(?i)(?:\"|')?(?:lodash|django|flask|express|axios|requests|log4j|spring)(?:\"|')?\s*(?:[=:]|==)\s*(?:\*|latest|\^?0(?:\.\d+)?(?:\.\d+)?(?:$|\s))", line):
                        self._add(id="DEP001", severity="medium", confidence="low", category="dependencies", title="Dependency appears broadly or weakly version constrained", file=source.path, line=number, evidence=line, impact="Unreviewed dependency changes can introduce vulnerabilities or break security assumptions.", remediation="Pin reviewed versions, maintain lockfiles, and run the ecosystem's vulnerability audit in CI.")
                    if re.search(r"(?i)(?:git\+https?://|https?://[^\s]+\.git)", line):
                        self._add(id="DEP002", severity="medium", confidence="medium", category="dependencies", title="Dependency sourced directly from a Git URL", file=source.path, line=number, evidence=line, impact="The dependency may bypass normal registry provenance and reproducibility controls.", remediation="Prefer a signed/reviewed registry release or pin the exact commit and verify provenance.")
            if basename == "package.json" and not any(Path(candidate.path).name.lower() in {"package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml"} for candidate in self.files):
                self._add(id="DEP003", severity="medium", confidence="high", category="dependencies", title="JavaScript manifest has no lockfile", file=source.path, line=1, evidence="No npm, Yarn, or pnpm lockfile found", impact="Installs may resolve different transitive code over time and cannot be reliably reproduced.", remediation="Generate and commit the lockfile with the chosen package manager, then use frozen/immutable installs in CI.")


def markdown_report(result: AuditResult) -> str:
    counts = result.counts()
    lines = [
        "# Security Red-Team Audit Report", "", f"- **Target:** `{result.target}`", f"- **Mode:** `{result.mode}`", f"- **Generated:** `{result.generated_at}`", f"- **Files scanned:** `{result.files_scanned}`", "",
        "## Summary", "", " | ".join(f"**{severity.title()}:** {counts[severity]}" for severity in SEVERITIES), "",
    ]
    if not result.findings:
        lines += ["No findings were produced by the configured checks.", ""]
    else:
        lines += ["## Findings", ""]
        for index, finding in enumerate(result.findings, 1):
            lines += [
                f"### {index}. [{finding.severity.upper()}] {finding.title}", "",
                f"- **ID:** `{finding.id}`  ", f"- **Category:** `{finding.category}`  ", f"- **Confidence:** `{finding.confidence}`  ", f"- **Location:** `{finding.file}:{finding.line}`", f"- **Evidence:** `{finding.evidence.replace(chr(96), chr(92) + chr(96))}`", f"- **Impact:** {finding.impact}", f"- **Remediation:** {finding.remediation}", "", "**Fix now:**", *[f"1. {step}" for step in finding.fix_steps], "", "**Verify the fix:**", *[f"- {step}" for step in finding.verification], "", "**Prevent recurrence:**", *[f"- {step}" for step in finding.prevention], "",
            ]
    if result.skipped_files:
        lines += ["## Skipped files", "", *[f"- `{item}`" for item in result.skipped_files], ""]
    lines += ["## Scope and limitations", "", "This is non-destructive static analysis. It does not prove exploitability, inspect runtime behavior, authenticate to services, scan arbitrary hosts, or replace manual threat modeling and dependency-specific audits.", ""]
    return "\n".join(lines)


def remediation_plan(result: AuditResult) -> str:
    """Render a release-oriented plan that can be handed to owners."""
    lines = [
        "# Security Remediation and Protection Plan", "",
        "Use this plan in order: contain exposed credentials, fix critical/high findings, then close medium/low findings and add the preventive controls.", "",
        "## Release gate", "",
        "" if result.findings else "No findings currently require remediation.",
    ]
    for severity in SEVERITIES:
        group = [finding for finding in result.findings if finding.severity == severity]
        if not group:
            continue
        lines += [f"## {severity.title()} priority ({len(group)})", ""]
        for finding in group:
            lines += [f"### `{finding.id}` — {finding.title}", f"- **Owner location:** `{finding.file}:{finding.line}`", f"- **Why it matters:** {finding.impact}", "- **Do now:"]
            lines += [f"  - {step}" for step in finding.fix_steps]
            lines += ["- **Done when:"]
            lines += [f"  - {step}" for step in finding.verification]
            lines += ["- **Protect it permanently:"]
            lines += [f"  - {step}" for step in finding.prevention] + [""]
    lines += [
        "## Repository-wide protection baseline", "",
        "- Keep production secrets out of source, build arguments, artifacts, logs, and issue comments; rotate on suspicion.",
        "- Require review for authentication, authorization, deserialization, file access, outbound requests, raw HTML, and infrastructure changes.",
        "- Run this audit in pull requests and before release; fail on high/critical findings until an approved exception exists.",
        "- Pin dependencies, third-party CI actions, container images, and infrastructure modules; review updates and generate lockfiles.",
        "- Use least privilege everywhere: CI tokens, cloud identities, containers, Kubernetes security contexts, database roles, and network ingress.",
        "- Add regression tests for each fixed finding and retain evidence of the verification step in the ticket or release record.",
        "- Re-run the audit after remediation and separately validate runtime behavior in an authorized staging environment.",
        "",
    ]
    return "\\n".join(lines)


def sarif_report(result: AuditResult) -> dict:
    return {
        "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
        "version": "2.1.0",
        "runs": [{
            "tool": {"driver": {"name": "security-redteam-audit", "informationUri": "https://example.invalid/security-redteam-audit", "rules": [{"id": finding.id, "name": finding.title} for finding in result.findings]}},
            "results": [{
                "ruleId": finding.id,
                "level": "error" if finding.severity in {"critical", "high"} else "warning" if finding.severity == "medium" else "note",
                "message": {"text": f"{finding.title}: {finding.impact}"},
                "locations": [{"physicalLocation": {"artifactLocation": {"uri": finding.file}, "region": {"startLine": finding.line}}}],
            } for finding in result.findings],
        }],
    }


def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Non-destructive authorized security audit for a local repository.")
    parser.add_argument("path", nargs="?", default=".", help="Repository directory to audit (default: current directory)")
    parser.add_argument("--mode", choices=("local", "public"), default="local", help="Threat model: local-only or intended public-facing deployment")
    parser.add_argument("--out", default="security-audit-report", help="Output directory (default: security-audit-report)")
    parser.add_argument("--fail-on", choices=SEVERITIES, default="high", help="Exit 1 if this severity or worse is found")
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv)
    try:
        result = Auditor(Path(args.path), args.mode).run()
    except ValueError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    output = Path(args.out)
    output.mkdir(parents=True, exist_ok=True)
    (output / "report.json").write_text(json.dumps({**asdict(result), "findings": [asdict(f) for f in result.findings]}, indent=2) + "\n", encoding="utf-8")
    (output / "report.md").write_text(markdown_report(result), encoding="utf-8")
    (output / "report.sarif").write_text(json.dumps(sarif_report(result), indent=2) + "\n", encoding="utf-8")
    (output / "remediation-plan.md").write_text(remediation_plan(result), encoding="utf-8")
    counts = result.counts()
    print(f"Scanned {result.files_scanned} files; findings: " + ", ".join(f"{s}={counts[s]}" for s in SEVERITIES))
    print(f"Reports: {output / 'report.md'}, {output / 'report.json'}, {output / 'report.sarif'}, {output / 'remediation-plan.md'}")
    threshold = SEVERITY_RANK[args.fail_on]
    return 1 if any(SEVERITY_RANK[f.severity] <= threshold for f in result.findings) else 0


if __name__ == "__main__":
    raise SystemExit(main())
