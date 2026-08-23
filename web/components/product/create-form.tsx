import type { ComponentProps } from "react";

type Props = ComponentProps<"form"> & { label: string; field: string; placeholder: string };

export function CreateForm({ label, field, placeholder, ...props }: Props) {
  return <form className="inline-form" {...props}><label>{label}<input name={field} placeholder={placeholder} maxLength={120} required /></label><button className="button button-primary" type="submit">Create</button></form>;
}
