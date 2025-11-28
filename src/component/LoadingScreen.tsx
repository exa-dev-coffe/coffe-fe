import Icon from "../assets/images/icon.png";


export default function LoadingScreen() {
    return (
        <div id="splash-screen">
            <div className="splash-content">
                <img src={Icon} alt="logo" className="splash-logo"/>
            </div>
        </div>
    )
}