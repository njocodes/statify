/** The numbers behind a chart as a table that only screen readers see. */
export function ChartData({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <table className="sr-only">
      <caption>{title}</caption>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <th scope="row">{k}</th>
            <td>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
