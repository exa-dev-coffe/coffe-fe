import Icon from "../assets/images/icon.png";
import GrabFood from "../assets/images/logoGrabFood.png";
import AstroKitchen from "../assets/images/logoAstroKicthen.png";
import ShoopeFoood from "../assets/images/logoShopeeFood.png";

const Footer = () => {
    return (
        <footer>
            <div className={'bg-primary flex gap-36 items-start p-10 justify-center'}>
                <div className="">
                    <img src={Icon} className={'w-20 mx-auto'} alt={'Logo'}/>
                    <h4 className={'text-white text-xl font-bold mt-4'}>
                        Diskusi Coffee
                    </h4>
                </div>
                <div className="w-64">

                    <h4 className={'text-gray-200 text-xl font-bold '}>
                        Address
                    </h4>
                    <p className={'text-gray-200 textsm mt-4'}>
                        Jl. Pal Merah Utara II No.24, RT.1/RW.2, Palmerah,
                        Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus
                        Ibukota Jakarta
                    </p>
                    <p className={'text-gray-200 '}>
                        11480
                    </p>
                </div>
                <div className="">
                    <h4 className={'text-gray-200 text-xl font-bold '}>
                        Information
                    </h4>
                    <ul className={'text-gray-200 textsm list-inside list-disc mt-4'}>
                        <li className={'text-gray-200 textsm'}>
                            About
                        </li>
                        <li className={'text-gray-200 textsm'}>
                            FAQ
                        </li>
                        <li className={'text-gray-200 textsm'}>
                            Contact Us
                        </li>
                        <li className={'text-gray-200 textsm'}>
                            Terms & Conditions
                        </li>
                    </ul>

                </div>
                <div className="">

                    <h4 className={'text-gray-200 text-xl font-bold '}>
                        Online Partner
                    </h4>
                    <div className={'flex items-center justify-center gap-4 mt-4'}>
                        <img className={'h-20 mx-auto object-cover'} src={GrabFood} alt={'Grab Food'}/>
                        <img className={'h-20 mx-auto object-cover'} src={AstroKitchen} alt={'Astro Kitchen'}/>
                        <img className={'h-20 mx-auto object-cover'} src={ShoopeFoood} alt={'Shoope Food'}/>
                    </div>
                </div>
            </div>
            <div className="bg-primary-dark py-4 text-center">
                <p className="text-gray-200">
                    Copyrights © {new Date().getFullYear()} All Rights Reserved
                </p>
            </div>
        </footer>
    )
}

export default Footer;