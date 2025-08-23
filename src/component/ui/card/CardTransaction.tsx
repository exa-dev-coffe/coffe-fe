import {formatCurrency, formatDateTimeShortString} from "../../../utils";
import DummyProduct from "../../../assets/images/dummyProduct.png";
import {Link} from "react-router";

interface CardTransactionProps {
}

const CardTransaction = ({}) => {
    return (
        <div className={'mt-10 bg-white p-8 rounded-2xl '}>
            <div className={'flex justify-between'}>
                <h4 className={'text-xl font-bold'}>
                    Table
                </h4>
                <p>
                    {formatDateTimeShortString(new Date().toISOString())}
                </p>
            </div>
            <div className={'flex justify-between my-7'}>
                <div className={'flex justify-start gap-10'}>
                    <div>
                        <img src={DummyProduct} className={'w-64 h-64 object-cover rounded-xl'} alt={'product'}/>
                        <h6 className={'text-xl mt-4 w-64 truncate'}>
                            Nama Product
                        </h6>
                    </div>
                    <div>
                        <img src={DummyProduct} className={'w-64 h-64 object-cover rounded-xl'} alt={'product'}/>
                        <h6 className={'text-xl mt-4 w-64 truncate'}>
                            Nama Product ajiasiaiaihai asiahsasia ashiasiai aiias
                        </h6>
                    </div>
                    <div>
                        <img src={DummyProduct} className={'w-64 h-64 object-cover rounded-xl'} alt={'product'}/>
                        <h6 className={'text-xl mt-4 w-64 truncate'}>
                            Nama Product
                        </h6>
                    </div>
                    <div>
                        <img src={DummyProduct} className={'w-64 h-64 object-cover rounded-xl'} alt={'product'}/>
                        <h6 className={'text-xl mt-4 w-64 truncate'}>
                            Nama Product
                        </h6>
                    </div>
                </div>
                <div className={'text-end '}>

                    <h5 className={'font-bold text-xl mt-7 mb-3'}>
                        {formatCurrency(1000)}
                    </h5>
                    <p>
                        5 Menu
                    </p>
                </div>
            </div>
            <div className={'flex justify-between items-center border-t border-gray-300 '}>
                <h5 className={'text-xl text-[#F9A825] font-bold mt-7 mb-3'}>
                    {/*${status === 1 ? `text-[#F9A825]` : status === 3 ? `text-[#F44336]` : status === 2 ? `text-[#47DC53]` : ``}>*/}
                    Order Confirmed
                </h5>
                <Link to={'/my-transaction/1'}
                      className={'bg-gray-200 px-5 py-2 rounded-lg transition-all duration-300 text-black hover:bg-gray-300'}>
                    Detail
                </Link>
            </div>
        </div>
    )
}

export default CardTransaction;