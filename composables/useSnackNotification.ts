import { ref } from "vue";
import type { CommonNotificationModel } from "~/types/commonNotificationModel";
export default function useSnackNotification() {
  const snackbar = useState<CommonNotificationModel>("commonNotification");
  function showNotification(msg: string, msgColor: string = "error") {
    snackbar.value.message = msg;
    snackbar.value.messageColor = msgColor;
    snackbar.value.isVisible = true;
  }

  return {
    showNotification,
  };
}
