import { toast } from 'react-toastify';

export const tostify = (type, massage) => {
    switch (type) {
        case "info":
            toast.info(massage, {
                theme: "light"
            });
            break;
        case "success":
            toast.success(massage, {
                theme: "light"
            });
            break;
        case "warn":
            toast.warn(massage, {
                theme: "light"
            });
            break;
        case "error":
            toast.error(massage, {
                theme: "light"
            });
            break;
        default:
            toast(massage, {
                theme: "light"
            });
            break;
    }
}