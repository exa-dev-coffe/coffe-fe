import {FaQuestionCircle} from "react-icons/fa";
import {useNavigate} from "react-router";

const NotFoundPage = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1)
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 px-4 text-center">
            <div className="max-w-md">
                <div className="flex justify-center mb-6 text-gray-500 text-6xl">
                    <FaQuestionCircle/>
                </div>
                <h1 className="text-6xl font-extrabold text-gray-800">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mt-2">Page Not Found</h2>
                <p className="text-gray-500 mt-4">
                    The page you're looking for doesn't seem to exist.
                </p>
                <button
                    onClick={handleBack}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;
