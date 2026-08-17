import Link from "next/link";
export default function NotFound() { return <section className="reading-page shell"><p className="kicker">404 / signal lost</p><h1>That frame does not exist.</h1><p className="lede">The page may have moved, or it may not have been built into the finished product yet.</p><Link className="button button-primary" href="/">Return home</Link></section>; }
