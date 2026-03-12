export default function Alert({ title = 'Something went wrong', message, action }) {
  return (
    <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/50 dark:text-rose-300">
      <p className="font-semibold">{title}</p>
      {message ? <p className="mt-1 text-sm">{message}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
