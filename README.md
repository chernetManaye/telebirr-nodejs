# telebirr-nodejs

A simple, opinionated Node.js SDK for integrating **Telebirr C2B payments** with automatic request signing, Fabric token handling, and checkout URL generation.

---

## Installation

```bash
npm install telebirr-nodejs
```

---

## Required Configuration

Telebirr requires credentials and callback URLs.
You should never hard-code secrets. Always load them from process.env.

---

### Required Credentials

| Name                   | Description                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `FABRIC_APP_ID`        | Fabric application ID (c4182ef8-9249-458a-985e-06d191f4d505 uuid-v4 string)            |
| `FABRIC_APP_SECRET`    | Fabric application secret ("fad0f06383c6297f54rr78694b974599" 32 hex character string) |
| `MERCHANT_APP_ID`      | Merchant application ID ("7606201678956824" 16 integer character string)               |
| `MERCHANT_CODE`        | Merchant code ("000000" 6 integer character string)                                    |
| `MERCHANT_PRIVATE_KEY` | RSA private key (PEM string)                                                           |

---

### Required URLs

| Name                    | Description                     |
| ----------------------- | ------------------------------- |
| `TELEBIRR_NOTIFY_URL`   | Server-to-server callback URL   |
| `TELEBIRR_REDIRECT_URL` | User redirect URL after payment |

---

### Basic Setup

---

```bash
import { TelebirrClient } from "telebirr-nodejs";

const client = new TelebirrClient({
  mode: "sandbox", // "simulate" | "sandbox" | "production"
  appId: process.env.FABRIC_APP_ID!,
  appSecret: process.env.FABRIC_APP_SECRET!,
  merchantAppId: process.env.MERCHANT_APP_ID!,
  merchantCode: process.env.MERCHANT_CODE!,
  merchantPrivateKey: process.env.MERCHANT_PRIVATE_KEY!,
  notifyUrl: process.env.TELEBIRR_NOTIFY_URL!,
  redirectUrl: process.env.TELEBIRR_REDIRECT_URL!,
  http: true, // allow HTTP in simulator mode
  IntegrationOption: "C2B",
});
```

---

### Important

MERCHANT_PRIVATE_KEY must be the full PEM string, including:

```bash
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

---

### Example API Routes

1. POST /payment/initiate
2. GET /payment/status
3. POST /payment/refund

---

### 1. Initiate Payment

Creates an order and redirects the user to the Telebirr checkout page.

```bash
app.post("/payment/initiate", async (req, res) => {
    const checkoutUrl = await client.preOrder({
        merchOrderId: "order123",
        title: "Phone",
        amount: "12",
        callbackInfo: "from web checkout",
    });

    res.redirect(checkoutUrl);
});
```

If you are using a frontend framework (for example React) and do not want to lose application state, return the checkout URL as JSON and let the frontend handle the redirection.

---

### 2. Query Payment Status

Used to check the payment result using the merchant order ID.

```bash
app.get("/payment/status/:merchOrderId", async (req, res) => {
    const { merchOrderId } = req.body;

    const info = await client.queryOrder(merchOrderId);

    res.json(info);
});
```

Please refer to Telebirr’s official documentation to correctly handle the query order json response:
https://developer.ethiotelecom.et/docs/H5%20C2B%20Web%20Payment%20Integration%20Quick%20Guide/queryOrder

---

### 3. Refund Payment

Refunds a completed transaction.

```bash
app.post("/payment/refund", async (req, res) => {
    const refundData = await client.refundOrder({
        merchOrderId: "order123",
        refundRequestNo: "original-transaction-id",
        refundReason: "customer request",
        amount: "12",
    });

    res.json(refundData);
});

```

Please refer to Telebirr’s official documentation to correctly handle the refund order json response:
https://developer.ethiotelecom.et/docs/H5%20C2B%20Web%20Payment%20Integration%20Quick%20Guide/RefundOrder

---

### Simulator Mode

To use the simulator provided by this package, set the mode to simulate.

```bash
import { TelebirrClient } from "telebirr-nodejs";

const client = new TelebirrClient({
    mode: "simulate",
    notifyUrl: "https://example.com/notify",
    redirectUrl: "https://example.com/redirect",
    http: true,
    IntegrationOption: "C2B",
});

```

This simulator is for learning and development purposes only.
The simulation server is provided by this package, not by Telebirr. For real testing, use Telebirr’s sandbox mode and whitelist your public IP address in the Telebirr portal.

---

### Supported Features

- Fabric token handling
- RSA-SHA256 request signing
- C2B checkout
- Order query
- Refunds
- Simulator support
- Notify URL Handling

Please refer to Telebirr’s official documentation to correctly handle notify callbacks:

https://developer.ethiotelecom.et/docs/H5%20C2B%20Web%20Payment%20Integration%20Quick%20Guide/Notify_Callback

---

### RSA Key Generation

You can generate private and public keys instantly.

```bash
import { generateKeys } from "telebirr-nodejs";

generateKeys({
    dir: process.cwd(),
    privateKeyName: "telefy_private.pem",
    publicKeyName: "telefy_public.pem",
    overwrite: false,
});

```

This will generate two .pem files in your root directory.

The merchantPrivateKey option always accepts a string, so you must read the private key file using Node.js fs and pass the value to the client configuration.
