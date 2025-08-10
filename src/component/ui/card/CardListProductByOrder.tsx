import DummyProduct from "../../../assets/images/dummyProduct.png";

interface CardListProductByOrderProps {
    name: string;
    image: string;
}

const CardListProductByOrder: React.FC<CardListProductByOrderProps> = ({
                                                                           name,
                                                                           image = DummyProduct
                                                                       }) => {
    return (
        <div className={'flex gap-4 items-center'}>
            <img className={'w-14 h-14 rounded-sm '} src={image} alt={name}/>
            <div>
                <h4 className={'text-lg font-semibold'}>{name}</h4>
            </div>
        </div>
    )
}

export default CardListProductByOrder;