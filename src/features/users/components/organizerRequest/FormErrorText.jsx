export function FormErrorText({ children }) {
  if (!children) return null;
  return <p className="mt-2 text-xs text-rose-500">{children}</p>;
}

export default FormErrorText;