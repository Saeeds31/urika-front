import { useCookie } from "#app";
import { ROUTES } from "~/utilities/routes";

export default defineNuxtRouteMiddleware((to, from) => {
  const authToken = useCookie("authToken").value;
  if (authToken && to.path == ROUTES.MEMBER.LOGIN) {
    return navigateTo(ROUTES.MEMBER.PROFILE);
  } else if (!authToken && to.path !== ROUTES.MEMBER.LOGIN) {
    return navigateTo(ROUTES.MEMBER.LOGIN);
  }
});
