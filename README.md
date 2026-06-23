# Byepo Feature Flag System

A scalable, multi-tenant feature flag management system consisting of a centralized backend and three distinct frontend applications tailored to different user roles.

## 🚀 How to Run

The easiest way to run the entire stack is using Docker Compose. Ensure you have Docker Desktop installed and running.

1. Install root dependencies:
   ```bash
   npm install
   ```
2. Start the entire application stack:
   ```bash
   npm run docker:all
   ```

*(Alternatively, you can run individual frontends using `npm run docker:super-admin`, `npm run docker:admin`, or `npm run docker:user`)*

### Access Points
- **Super Admin Portal**: [http://localhost:3000](http://localhost:3000)
- **Org Admin Portal**: [http://localhost:3001](http://localhost:3001)
- **User Portal**: [http://localhost:3002](http://localhost:3002)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🔄 Project Flow (How it Works)

The system enforces a strict top-down hierarchy:

1. **Super Admin Layer (`:3000`)**
   - The Super Admin logs in with predefined environment credentials (`admin@byepo.com`).
   - They create **Organizations** and generate a unique *Invite Link* for the organization's initial Admin.

2. **Organization Admin Layer (`:3001`)**
   - The intended Org Admin opens the invite link, sets their secure password, and accesses their organization's dashboard.
   - Here, they can create, toggle, and delete **Feature Flags**.
   - They can also generate invite links to onboard standard Users into their organization.

3. **Standard User Layer (`:3002`)**
   - Users accept the organization invite, create an account, and log in.
   - They are presented with a dashboard where they can check the status of specific feature flags active in their assigned organization.
