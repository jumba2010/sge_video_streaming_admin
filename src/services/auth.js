export const TOKEN_KEY = "NMCTOKEN2019@123";
export const SUCURSAL="SUCURSAL2019@1234"
export const USER_KEY = "NMCUSER2019@123";
export const isAuthenticated = () => localStorage.getItem(USER_KEY) !== null;
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const defaultPassword='sge2019'

export const login = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};
export const getUserDetails = () =>localStorage.getItem(USER_KEY);
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);   
  localStorage.removeItem(SUCURSAL);

};

