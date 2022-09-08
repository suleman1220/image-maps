function Color({ color, border, onClick }) {
  return (
    <div
      role="button"
      className="rounded"
      style={{ backgroundColor: color, width: '40px', height: '30px', border }}
      onClick={onClick}
    ></div>
  );
}

export default Color;
