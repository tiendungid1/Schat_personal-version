export class UserDetail {
    payload;

    role;

    permission;

    constructor(payload) {
        this.payload = payload;
    }

    getRole() {
        this.role = this.payload?.role ?? [];
    }

    getPermission() {
        this.permission = this.payload?.permission ?? [];
    }
}
