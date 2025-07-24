import {FaLock} from "react-icons/fa";
import {useNavigate} from "react-router";

const ForbiddenPage = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1)
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 px-4 text-center">
            <div className="max-w-md">
                <div className="flex justify-center mb-6 text-red-500 text-6xl">
                    <FaLock/>
                </div>
                <h1 className="text-6xl font-extrabold text-gray-800">403</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mt-2">Forbidden</h2>
                <p className="text-gray-500 mt-4">
                    You don't have permission to access this page.
                </p>
                <button
                    onClick={handleBack}
                    className="mt-6 px-6 py-2 bg-red-500 text-white font-semibold rounded-md shadow hover:bg-red-600 transition cursor-pointer"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default ForbiddenPage;
