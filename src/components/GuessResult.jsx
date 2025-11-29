export default function GuessResult({ results }) {
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
      {results.map((res, i) => (
        <div
          key={i}
          style={{
            width: 25,
            height: 25,
            borderRadius: 5,
            background:
              res === "green" ? "green" :
              res === "yellow" ? "gold" : "red"
          }}
        />
      ))}
    </div>
  );
}
