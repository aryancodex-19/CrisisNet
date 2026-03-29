const testLogin = async () => {
  const req = await fetch("http://localhost:3000/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      email: "admin@crisisnet.in",
      password: "password123",
      redirect: "false"
    }).toString()
  });
  
  const text = await req.text();
  console.log("Status:", req.status);
  console.log("Headers:", Array.from(req.headers.entries()));
  console.log("Body:", text);
};
testLogin();
