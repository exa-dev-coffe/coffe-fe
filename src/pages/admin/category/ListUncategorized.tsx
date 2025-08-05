import {useEffect} from "react";
import Loading from "../../../component/ui/Loading.tsx";
import useCategory from "../../../hook/useCategory.ts";
import CardCatalogUncategorized from "../../../component/ui/card/CardCatalogUncategorized.tsx";
import DummyProduct from "../../../assets/images/dummyProduct.png";


const ListUncategorizedPage = () => {

    const {
        getCategoryOptions,
        loading,
        options
    } = useCategory()

    useEffect(() => {
        getCategoryOptions()
    }, [])


    return (

        <div className={'mt-10 bg-white p-8 rounded-lg'}>
            <div className={'flex justify-between'}>
                <h4 className={'text-xl font-semibold'}>
                    Menu
                </h4>
            </div>
            {
                loading ?
                    <Loading/>
                    :
                    // totalData === 0 ?
                    //     <div className={'text-center space-y-6 my-20'}>
                    //         No data found
                    //     </div>
                    //     :
                    <>
                        <div className={"mt-6"}>
                            <div><CardCatalogUncategorized id={1} name={"asas"} description={"lerjejr"}
                                                           optionsDefault={options}
                                                           handleUpdateCategory={(id: number, value: {
                                                               value: number;
                                                               label: string
                                                           }) => console.log(id, value)}
                                                           photo={DummyProduct}/>
                            </div>
                        </div>
                    </>
            }
        </div>
    );
}

export default ListUncategorizedPage;