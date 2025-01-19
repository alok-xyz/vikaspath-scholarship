# Firebase Admin User Creation Script

## Prerequisites
1. Ensure you have Node.js installed
2. Have Firebase project set up
3. Install required dependencies

## Setup Steps

1. Install Dependencies
```bash
npm install firebase
```

2. Update Firebase Configuration
- Open `createAdminUsers.js`
- Replace the `firebaseConfig` object with your project's Firebase configuration
  - You can find this in your Firebase Console > Project Settings > Your Apps > SDK setup and configuration

3. Enable Firestore
- Go to Firebase Console
- Navigate to Firestore Database
- Create a database in test mode

4. Run the Script
```bash
node createAdminUsers.js
```

## User Metadata Storage

### Firebase Authentication
- Stores basic user authentication details
- Includes email, unique user ID

### Firestore Collection: `admin_users`
Each admin user document contains:
- `uid`: Unique Firebase Authentication ID
- `email`: User's email address
- `role`: User role type
  - `SYSTEM_ADMIN`
  - `INSTITUTION_ADMIN`
- `name`: Full name of admin
- `institution`: Associated institution (if applicable)
  - `KOLKATA_UNIVERSITY`
  - `SANTIPUR_UNIVERSITY`
  - `PPS_COLLEGE`
- `accessLevel`: Permission level
  - `FULL_ACCESS`
  - `INSTITUTION_ACCESS`
- `createdAt`: Timestamp of user creation
- `lastLogin`: Timestamp of last login (initially null)

## Created Admin Users
- System Administrator
  - Email: `admin@scholarship.edu`
  - Password: `ADMIN24`
  - Role: System Administrator
  - Access: Full Access

- Institution Admins
  1. Kolkata University
     - Email: `kolkatauniversity@scholarship.edu`
     - Password: `KOL202469`
     - Role: Institution Admin
     - Institution: Kolkata University

  2. Santipur University
     - Email: `santiparuniversity@scholarship.edu`
     - Password: `SANTIUN202469`
     - Role: Institution Admin
     - Institution: Santipur University

  3. PPS College
     - Email: `ppscollege@scholarship.edu`
     - Password: `PPSC202469`
     - Role: Institution Admin
     - Institution: PPS College

## Security Notes
- Use Firebase Console to manage user access
- Implement additional security rules in Firestore
- Regularly audit and rotate admin credentials
