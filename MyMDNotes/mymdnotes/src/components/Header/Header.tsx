import { Component } from "solid-js"
import { msalInstance } from '../../auth/authConfig';

interface HeaderProps {
  user: string;
  auth:boolean;
}
const logout = async () => {
  try {
    // Use logoutRedirect to log the user out and redirect them to the specified URL (like the home page or a logout confirmation page)
    await msalInstance.logoutRedirect({
      // postLogoutRedirectUri: "https://zionai.com/about-us/", // Redirect to the home page (or any URL after logout)
    });
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

const Header: Component<HeaderProps> = (props) => {
  return (
    <header class="relative z-50 flex justify-between items-center p-4 shadow-lg">
      <div class="flex items-center">
        <img class="max-w-[100px] w-full mr-4" src="/src/assets/images/icons/Logotype_gradient.svg" alt="zionai" />
        <h1 class="font-bold text-sm">My MD Notes</h1>
      </div>
      <div class='space-x-2'>
        {props.user && props.auth &&<>
          <span class='text-sm font-semibold mr-3'>{props.user}</span>
          <button class="button button-blue" onclick={logout}>Logout</button>
        </>}
        {!props.user && !props.auth &&<>
          <button class="button button-green">Login</button>
        </>}
      </div>
    </header>
  )
}

export default Header
