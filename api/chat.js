export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: "GlobalAnalyst API",
    status: "running"
  });
}

