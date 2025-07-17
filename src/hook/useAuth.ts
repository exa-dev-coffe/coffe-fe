import type {BodyRegister} from "../model/auth.ts";

const useAuth = () => {

    const register = async (data: BodyRegister) => {
        console.log('Registering data', data);
    }

    return {
        register
    }
}

export default useAuth;

