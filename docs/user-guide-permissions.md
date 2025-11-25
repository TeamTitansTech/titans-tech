# User Permissions Management Guide

**For Company Administrators and Managers**

This guide explains how to manage user access and permissions in the Titans Tech system.

## Table of Contents

1. [Understanding User Roles](#understanding-user-roles)
2. [Permission Categories](#permission-categories)
3. [Managing Users](#managing-users)
4. [Setting Permissions](#setting-permissions)
5. [Multi-Branch Management](#multi-branch-management)
6. [Best Practices](#best-practices)
7. [FAQs](#faqs)

---

## Understanding User Roles

Titans Tech uses a three-level hierarchy to organize users within your company:

### Company Administrator (Admin)

- **Highest level** in your organization
- Has **full access** to all branches and all features
- Can promote users to Company Manager
- Can manage all users across the company
- **Only ONE** Company Administrator per company
- **Badge**: 🔒 Company Admin

### Company Manager (Manager)

- **Second level** in your organization
- Has **full access** to all branches and all features (same as Admin)
- Can manage users, machines, services, and blueprints
- Can be promoted by the Company Administrator
- **Multiple managers** allowed per company
- **Badge**: ⭐ Company Manager

### Regular Users

Branch-specific access with customizable permissions:

#### Branch Manager

- Full control of a **specific branch**
- Can manage users, machines, and services within their branch
- Similar to Company Manager but limited to one branch
- **Badge**: 👔 Branch Manager

#### Employee/Worker

- **Limited operational access** to a branch
- Can view data and perform daily tasks
- Cannot manage users or change settings
- **Badge**: 👤 Employee

---

## Permission Categories

Permissions are organized into **5 main categories** with a total of **18 individual permissions**:

### 1. User Management (6 permissions)

| Permission             | Description                                 |
| ---------------------- | ------------------------------------------- |
| **View Users**         | See the list of users and their information |
| **Add Users**          | Create new user accounts                    |
| **Edit Users**         | Modify user information (name, email)       |
| **Delete Users**       | Remove users from branches or the company   |
| **Manage Permissions** | Change what other users can do              |
| **Assign to Branches** | Add users to different branches             |

### 2. Branch Management (2 permissions)

| Permission        | Description                            |
| ----------------- | -------------------------------------- |
| **View Branches** | See branch information and details     |
| **Edit Branches** | Modify branch settings and information |

### 3. Machine Blueprints (4 permissions)

| Permission            | Description                              |
| --------------------- | ---------------------------------------- |
| **View Blueprints**   | See machine templates and specifications |
| **Create Blueprints** | Add new machine templates                |
| **Edit Blueprints**   | Modify existing templates                |
| **Delete Blueprints** | Remove machine templates                 |

### 4. Machine Management (4 permissions)

| Permission            | Description                                |
| --------------------- | ------------------------------------------ |
| **View Machines**     | See the list of machines and their details |
| **Register Machines** | Add new machines to the system             |
| **Edit Machines**     | Modify machine information                 |
| **Remove Machines**   | Delete machines from the system            |

### 5. Service Records (4 permissions)

| Permission          | Description                            |
| ------------------- | -------------------------------------- |
| **View Services**   | See inspection and maintenance records |
| **Create Services** | Add new inspection/maintenance records |
| **Edit Services**   | Modify existing service records        |
| **Delete Services** | Remove service records                 |

---

## Managing Users

### Adding a New User

1. **Navigate to Settings** → Click on the Settings icon
2. **Select a Branch** → Choose the branch where you want to add the user
3. **Click "Add User"** → Opens the Add User dialog
4. **Fill in User Information**:
   - Name
   - Email (must be unique)
   - The system will generate a default password: `password`
   - User will be required to change it on first login

5. **Choose Permission Level**:

   **Option A: Use a Role Preset** (Recommended)
   - **Manager**: Full control of this branch
     - Gets all 18 permissions enabled
     - Can manage users, machines, services, and settings

   - **Employee**: Standard operational access
     - Can view all resources
     - Can create and update service records
     - Cannot manage users or change settings

   **Option B: Custom Permissions**
   - Select "Custom" to enable individual permissions
   - Check/uncheck specific permissions as needed
   - Use the "Select All" or "Clear All" buttons for each category

6. **Apply to Multiple Branches** (Optional):
   - Check "Apply to All Branches" to give the user the same permissions in all branches
   - Or add them to individual branches with different permissions later

7. **Click "Add User"** → User is created and added to the branch

### Editing User Permissions

1. **Go to Settings** → Select the branch
2. **Find the User** → In the user table
3. **Click "Edit"** (✏️ icon)
4. **Modify Information**:
   - Change name or email
   - Update permissions
   - Promote to Company Manager (if you're Company Admin)

5. **Choose Update Scope**:
   - **This Branch Only**: Updates permissions only for the selected branch
   - **All Branches**: Updates the user's permissions in all branches they belong to

6. **Save Changes**

### Deleting a User

1. **Go to Settings** → Select the branch
2. **Find the User** → In the user table
3. **Click "Delete"** (🗑️ icon)
4. **Choose Deletion Scope**:
   - **Remove from This Branch**: User loses access to this branch only
   - **Remove from Company**: User is completely removed from your company

5. **Confirm Deletion**

### Promoting to Company Manager

**Requirements**: You must be a Company Administrator

1. **Edit the User** → Click the Edit button
2. **Toggle "Company Manager"** → Enable the switch
3. **Save Changes**

The user immediately gains full access to all branches.

---

## Setting Permissions

### Understanding Permission Levels

Permissions follow a **CRUD** pattern (Create, Read, Update, Delete):

- **View/Read**: User can see information but not change it
- **Create/Add**: User can add new items
- **Edit/Update**: User can modify existing items
- **Delete/Remove**: User can remove items

### Role Presets Explained

#### Manager Preset ✅

**Full Control** - Best for:

- Branch supervisors
- Department heads
- Senior technicians who manage teams

**Includes all 18 permissions**:

- ✅ All User Management
- ✅ All Branch Management
- ✅ All Blueprint Management
- ✅ All Machine Management
- ✅ All Service Management

#### Employee Preset 👷

**Operational Access** - Best for:

- Field technicians
- Inspectors
- Maintenance workers

**Includes basic permissions**:

- ✅ View all resources (users, machines, services, blueprints)
- ✅ Create service records
- ✅ Update service records
- ❌ Cannot manage users
- ❌ Cannot delete anything
- ❌ Cannot change settings

### Creating Custom Permission Sets

For specialized roles, create custom permission combinations:

#### Examples:

**Quality Inspector**

- ✅ View Machines
- ✅ View Services
- ✅ Create Services
- ❌ Everything else

**Equipment Manager**

- ✅ View/Create/Edit/Delete Machines
- ✅ View/Create/Edit/Delete Blueprints
- ✅ View Services
- ❌ User management

**Training Coordinator**

- ✅ View Users
- ✅ View Machines
- ✅ View Services
- ❌ Cannot modify anything

---

## Multi-Branch Management

Users can belong to **multiple branches** with **different permissions** in each.

### Scenario 1: User Works at Multiple Locations

**Example**: João works at both São Paulo and Rio branches

- **São Paulo Branch**: Manager (full permissions)
- **Rio Branch**: Employee (view + services only)

**How to set up**:

1. Add João to São Paulo branch with Manager preset
2. Add João to Rio branch with Employee preset
3. João sees both branches in his dashboard
4. His access level changes based on which branch he's viewing

### Scenario 2: Updating Permissions Across All Branches

**Example**: Maria is promoted to Company Manager role

**Option A: Use Company Manager Promotion** (Recommended)

1. Edit Maria's user profile
2. Toggle "Company Manager"
3. She automatically gets full access to all branches

**Option B: Update All Branches Manually**

1. Edit Maria's user profile
2. Select "All Branches" scope
3. Set permissions to Manager preset
4. This updates her permissions in every branch

---

## Best Practices

### Security Guidelines

1. **Follow the Principle of Least Privilege**
   - Give users only the permissions they need for their job
   - Start with Employee preset and add permissions as needed
   - Regularly review and update permissions

2. **Protect Sensitive Permissions**
   - Be careful with "Manage Permissions" - this allows users to change others' access
   - Be careful with "Delete" permissions - these are permanent actions
   - Limit "Assign to Branches" to trusted users only

3. **Use Role Presets When Possible**
   - Manager preset for supervisors
   - Employee preset for workers
   - Custom only when needed

4. **Force Password Changes**
   - All new users get the default password: `password`
   - They **must** change it on first login
   - Encourage strong passwords

### Organizational Structure

1. **Designate a Single Company Administrator**
   - This person has ultimate control
   - Only System Support can change this
   - Choose someone reliable and always available

2. **Appoint Multiple Company Managers**
   - For redundancy and coverage
   - They have the same access as the Admin
   - Can help with user management

3. **Create Branch Managers for Each Location**
   - One responsible person per branch
   - Full branch permissions
   - Reports to Company Managers or Admin

4. **Regular Permission Audits**
   - Review user permissions quarterly
   - Remove access for inactive users
   - Update permissions when roles change

### Common Workflows

#### Onboarding a New Employee

1. Add user to their branch
2. Start with Employee preset
3. Train them on system usage
4. Adjust permissions based on actual needs

#### Employee Promotion

1. Edit user's permissions
2. Upgrade to Manager preset or custom
3. Or promote to Company Manager if appropriate

#### Employee Transfer

1. Add user to new branch with appropriate permissions
2. Remove from old branch if necessary
3. Or keep access to both branches if needed

#### Employee Departure

1. Delete user from company (not just branch)
2. Review and reassign their pending tasks
3. Audit any changes they made

---

## FAQs

### General Questions

**Q: How many Company Administrators can we have?**
A: Only ONE per company. This ensures clear accountability and prevents conflicts.

**Q: How many Company Managers can we have?**
A: As many as you need. Multiple managers provide redundancy and coverage.

**Q: What's the difference between Company Manager and Company Admin?**
A: They have the same permissions and access. The only difference is that Company Admin can promote others to Company Manager, and only System Support can change who is Company Admin.

**Q: Can a user belong to multiple branches?**
A: Yes! Users can have different permission levels in each branch.

### Permission Questions

**Q: What happens if I set "Custom" permissions?**
A: The preset is replaced with your specific selection. You can check/uncheck individual permissions.

**Q: Can an Employee promote themselves to Manager?**
A: No. Only users with "Manage Permissions" permission can change permissions, and Employees don't have that by default.

**Q: Can I remove the Company Administrator?**
A: No. Only System Support (platform administrators) can change who is Company Admin.

**Q: What does "Manage Permissions" allow?**
A: Users with this permission can change other users' permissions within their branch. Use this carefully.

### Technical Questions

**Q: What is the default password for new users?**
A: All new users get the password: `password` (lowercase). They must change it on first login.

**Q: Can users reset their own password?**
A: Yes, after first login they can change their password in their profile settings.

**Q: What happens when I delete a user from a branch?**
A: They lose access to that branch only. If they belong to other branches, they keep that access.

**Q: What happens when I delete a user from the company?**
A: They are completely removed and lose all access to the system.

**Q: Do Company Managers and Admins need to be added to branches?**
A: No. They automatically have access to all branches without being explicitly added.

---

## Need Help?

If you encounter any issues or need assistance:

1. **Contact System Support**: Reach out to Titans Tech platform administrators
2. **Check Technical Documentation**: See `permissions-system.md` for detailed technical information
3. **Training Resources**: Ask your Company Administrator for additional training

---

**Document Version**: 1.0
**Last Updated**: 2025
**For**: Titans Tech Platform - Company Administrators and Managers
