import resend
import os
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

# Using Resend's test sender for now. When you have a custom domain, change this.
FROM_EMAIL = "KLOT <onboarding@resend.dev>"

def _send(to: str, subject: str, html: str):
    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": to,
            "subject": subject,
            "html": html,
        })
        return True
    except Exception as e:
        print(f"Email send failed: {e}")
        return False

# ── Templates ────────────────────────────────────────────────

BASE_STYLE = """
<style>
  body { background: #060606; color: white; font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; }
  .wrapper { max-width: 560px; margin: 0 auto; padding: 60px 32px; }
  .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 1.4rem; font-weight: 900; letter-spacing: 0.4em; color: white; text-align: center; margin-bottom: 48px; }
  h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.8rem; font-weight: 700; color: white; margin: 0 0 16px; }
  p { color: rgba(255,255,255,0.6); font-size: 0.875rem; line-height: 1.8; margin: 0 0 16px; font-weight: 300; }
  .item { padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; }
  .label { color: rgba(255,255,255,0.35); font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 6px; }
  .value { color: white; font-size: 0.85rem; }
  .footer { border-top: 1px solid rgba(255,255,255,0.06); margin-top: 48px; padding-top: 24px; color: rgba(255,255,255,0.2); font-size: 0.7rem; text-align: center; }
  .btn { display: inline-block; background: white; color: black !important; padding: 12px 28px; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 600; text-decoration: none; margin: 24px 0; }
</style>
"""

def send_order_confirmation(email: str, name: str, order_id: int, total: float, items: list, address: str):
    items_html = ""
    for item in items:
        items_html += f"""
        <div class="item">
          <div>
            <p class="value" style="margin: 0;">{item['name']}</p>
            <p style="color: rgba(255,255,255,0.35); font-size: 0.7rem; margin: 4px 0 0;">Size {item['size']} · Qty {item['quantity']}</p>
          </div>
          <p class="value" style="margin: 0;">₹{(item['price'] * item['quantity']):,.2f}</p>
        </div>
        """

    html = f"""
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">{BASE_STYLE}</head><body>
    <div class="wrapper">
      <p class="logo">K L O T</p>
      <h1>Order confirmed.</h1>
      <p>Thank you, {name.split(' ')[0]}. We've received your order and it's being prepared with care.</p>
      <p style="color: rgba(255,255,255,0.35); font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase; margin: 32px 0 12px;">— Order #{order_id}</p>
      {items_html}
      <div class="item" style="border: none; padding-top: 20px;">
        <p class="value" style="margin: 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">Total</p>
        <p class="value" style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 1.3rem;">₹{total:,.2f}</p>
      </div>
      <p style="color: rgba(255,255,255,0.35); font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase; margin: 32px 0 8px;">— Delivering to</p>
      <p style="font-size: 0.8rem;">{address}</p>
      <div class="footer">
        <p style="margin: 0;">You'll receive shipping updates shortly.</p>
        <p style="margin: 8px 0 0;">© 2026 KLOT. Wear the silence.</p>
      </div>
    </div>
    </body></html>
    """
    return _send(email, f"KLOT — Order #{order_id} confirmed", html)


def send_newsletter_welcome(email: str):
    html = f"""
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">{BASE_STYLE}</head><body>
    <div class="wrapper">
      <p class="logo">K L O T</p>
      <h1>Welcome to the inner circle.</h1>
      <p>You're now first in line — for drops, fits, and the occasional thought experiment in cloth.</p>
      <p>No spam. Just signal.</p>
      <a href="https://klot-website.vercel.app/collections" class="btn">Explore Collection</a>
      <div class="footer">
        <p style="margin: 0;">You're receiving this because you signed up at klot-website.vercel.app</p>
        <p style="margin: 8px 0 0;">© 2026 KLOT. Wear the silence.</p>
      </div>
    </div>
    </body></html>
    """
    return _send(email, "Welcome to KLOT <3", html)


def send_order_status_update(email: str, name: str, order_id: int, status: str):
    status_messages = {
        "confirmed": "Your order is confirmed and being prepared.",
        "shipped":   "Your order is on its way.",
        "delivered": "Your order has been delivered. We hope you love it.",
        "cancelled": "Your order has been cancelled.",
    }
    msg = status_messages.get(status, f"Your order status is now: {status}")

    html = f"""
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">{BASE_STYLE}</head><body>
    <div class="wrapper">
      <p class="logo">K L O T</p>
      <h1>Order update.</h1>
      <p>Hi {name.split(' ')[0]},</p>
      <p>{msg}</p>
      <p style="color: rgba(255,255,255,0.35); font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase; margin: 32px 0 12px;">— Order #{order_id}</p>
      <p style="color: white; font-size: 1rem; letter-spacing: 0.15em; text-transform: uppercase;">{status}</p>
      <div class="footer">
        <p style="margin: 0;">Questions? Reply to this email.</p>
        <p style="margin: 8px 0 0;">© 2026 KLOT. Wear the silence.</p>
      </div>
    </div>
    </body></html>
    """
    return _send(email, f"KLOT — Order #{order_id} {status}", html)
