import BgMenu from '../../assets/images/bgMenu.png';

const DataLocation = [
    {
        title: 'Bekasi',
        address: 'Jl. Raya Pekayon No.002, Lt. 3 Pekayon Jaya, Kec. Bekasi Selatan, Kota Bekasi, Jawa Barat, Bekasi 17148',
    },
    {
        title: 'Jakarta',
        address: 'Jl. Pal Merah Utara II Kec. Palmerah, Kota Jakarta Barat,  Daerah Khusus  Ibukota Jakarta 11480',
    },
    {
        title: 'Tangerang',
        address: 'Jl. Alam Sutera Boulevard No.Kav. 21, Pakulonan, Kec. Serpong Utara, Kota Tangerang Selatan, Banten 15325',
    },
    {
        title: 'Balikpapan',
        address: 'Kompleks Mall Pentacity, Gn. Bahagia, Kecamatan Balikpapan Selatan, Kota Balikpapan, Kalimantan Timur 76114,',
    },
    {
        title: 'Bali',
        address: 'Jl. Bypass Ngurah Rai No.5, Kuta,  Kec. Kuta, Kabupaten Badung, Bali 80361',
    },
    {
        title: 'Papua',
        address: 'Jl. Yos Sudarso No.8 LG Floor, Sanggeng,  Kec. Manokwari Bar., Kabupaten Manokwari,  Papua Barat 98311'
    },
    {
        title: 'Surabaya',
        address: ' Jl. Jenderal Basuki Rachmat No.8-12, Kedungdoro, Kec. Tegalsari, Kota SBY, Jawa Timur 60261',
    }

]


const LocationPage = () => {

    return (
        <div className="relative flex flex-col items-center min-h-screen">
            <img src={BgMenu} className="w-full absolute h-[550px]" alt="background menu"/>
            <div className="absolute top-0 w-full my-32 rounded-b-full ">
                <h3 className="sm:text-6xl text-4xl font-bold text-center text-white ">Locations</h3>
                <p className="sm:text-2xl text-lg text-center text-gray-200 mt-7">Welcome to our Locations, where every
                    visit is a unique experience designed to <br/> make you feel right at home. </p>
            </div>
            <div
                className="z-20 mt-80 text-black mb-20 w-[90%] mx-auto text-center bg-white h-full pb-10 rounded-2xl ">
                <h3 className="mt-10 text-4xl font-bold text-black">Find Us Near You</h3>
                <div className='grid 2xl:grid-cols-3 xl:grid-cols-2 gap-7 p-5 mx-5 mt-10 text-start '>
                    {DataLocation.map((item, index) => (
                        <div key={index} className={'flex'} data-aos="fade-up"
                             data-aos-delay={index * 100}
                             data-aos-duration={1000}
                        >
                            <div
                                className="p-10 bg-white rounded-lg hover:bg-gray-200 duration-1000 transition-colors shadow-md w-full">
                                <h3 className="mb-3 text-xl font-semibold text-gray-700 text-primary">{item.title}</h3>
                                <p className="text-gray-500">{item.address}</p>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
};

export default LocationPage;