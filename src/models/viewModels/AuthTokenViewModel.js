class AuthTokenViewModel {
    constructor({access_token, role, user_id, employee_id}) {
        this.access_token = access_token;
        this.role = role;
        this.user_id = user_id;
        this.employee_id = employee_id; // para compatibilidade
    }
}

export default AuthTokenViewModel;