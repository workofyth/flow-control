import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export interface UserPerms {
  username: string;
  password?: string; // We'll keep it simple for this demo
  role: 'superadmin' | 'user';
  allowedDags: string[]; // ['*'] for all
}

function initUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers: UserPerms[] = [
      {
        username: 'superadmin',
        password: 'adminpassword', // In production use hashing
        role: 'superadmin',
        allowedDags: ['*'],
      }
    ];
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'));
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  }
}

export function getUsers(): UserPerms[] {
  initUsers();
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data);
}

export function saveUsers(users: UserPerms[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function addUser(user: UserPerms) {
  const users = getUsers();
  if (users.find(u => u.username === user.username)) {
    throw new Error('User already exists');
  }
  users.push(user);
  saveUsers(users);
}
