# [DEPRECATED / OPTIONAL] Admin Custom Claim Script

> **IMPORTANT ARCHITECTURAL NOTICE:**
> This custom claim tool is **no longer required** for the Kolhapur Cab Service admin portal.
> 
> The project now uses Cloud Firestore's **`admins` collection** as the **Single Source of Truth** for administrative authorization.

---

## How Admin Authorization Works Now

Instead of needing complex Firebase Admin SDK private keys and CLI custom claim scripts:

1. You authenticate via Firebase Email / Password (e.g. `admin@gmail.com`).
2. The application checks the Firestore document:
   ```
   admins/{YOUR_AUTH_UID}
   ```
3. If:
   - `role === "admin"`
   - `active === true`
   
   Access is instantly granted to the admin dashboard!

---

## Manual Setup via Firebase Console

To grant admin access to any account:
1. Open the [Firebase Console Authentication](https://console.firebase.google.com/project/cab-service-9ed9e/authentication/users) tab.
2. Find the user `admin@gmail.com` and copy their **User UID**.
3. Open the [Cloud Firestore Database](https://console.firebase.google.com/project/cab-service-9ed9e/firestore/data) tab.
4. Click **"Start collection"** (or open existing `admins` collection):
   - **Collection ID**: `admins`
   - **Document ID**: `<PASTE_USER_UID_HERE>`
5. Add the following fields:
   - `role` (string) = `"admin"`
   - `active` (boolean) = `true`
   - `email` (string) = `"admin@gmail.com"`
6. Click **Save**.
7. Return to the Admin Dashboard and click **"Re-check Admin Permissions"**. Full access is granted immediately!
