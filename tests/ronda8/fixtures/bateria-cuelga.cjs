require('fs').writeFileSync(process.env.PIDFILE, String(process.pid));
setInterval(() => {}, 1000);
