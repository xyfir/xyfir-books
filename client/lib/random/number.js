export default function(min, max, int = true) {
  if (int) return Math.floor(Math.random() * (max - min + 1)) + min;
  else return Math.random() * (max - min + 1) + min;
}
