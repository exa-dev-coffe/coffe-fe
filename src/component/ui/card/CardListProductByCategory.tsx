import DummyProduct from "../../../assets/images/dummyProduct.png";

interface CardListProductByCategoryProps {
    name: string;
    description: string;
    image: string;
}

const CardListProductByCategory: React.FC<CardListProductByCategoryProps> = ({
                                                                                 name,
                                                                                 description,
                                                                                 image = DummyProduct
                                                                             }) => {
    return (
        <div className={'flex gap-4 items-center'}>
            <img className={'w-14 h-14 rounded-sm '} src={image} alt={name}/>
            <div>
                <h4 className={'text-lg font-semibold'}>{name}</h4>
                <p className={'text-sm max-w-40 truncate text-gray-500'}>{description}</p>
            </div>
        </div>
    )
}

export default CardListProductByCategory;