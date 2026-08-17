import React, {useEffect, useState} from "react";
import { useTableOptionsQuery } from "@/features/tables/hooks/useTable.ts";
import {useCartContext} from "@/app/providers/CartContext.ts";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import Dropdown, {type DropdownOption} from "@/components/ui/Dropdown.tsx";
import Input from "@/components/ui/Input.tsx";
import {HiOutlineDesktopComputer} from "react-icons/hi";

export interface TablePickerModalProps {
    show: boolean;
    onClose: () => void;
}

export const TablePickerModal: React.FC<TablePickerModalProps> = ({show, onClose}) => {
    const {cart, setTable, setOrderFor} = useCartContext();
    const { data: optionsTable = [] } = useTableOptionsQuery();

    const [selectedTable, setSelectedTable] = useState<DropdownOption | null>(null);
    const [customerName, setCustomerName] = useState(cart.orderFor || "");

    useEffect(() => {
        if (cart.tableId > 0) {
            setSelectedTable({value: cart.tableId, label: cart.tableName});
        }
        if (cart.orderFor) {
            setCustomerName(cart.orderFor);
        }
    }, [cart]);

    const handleSave = () => {
        if (selectedTable) {
            setTable({tableId: selectedTable.value, tableName: selectedTable.label});
        }
        if (customerName) {
            setOrderFor(customerName);
        }
        onClose();
    };


    return (
        <Modal show={show} handleClose={onClose} size="md" title="Welcome to Diskusi Coffee">
            <div className="space-y-6 py-2">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300">
                    <HiOutlineDesktopComputer className="text-2xl shrink-0 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs sm:text-sm leading-relaxed">
                        Please select your dine-in table number and enter your name so our baristas can deliver your order directly to you!
                    </p>
                </div>

                <div className="space-y-4">
                    <Input
                        label="Your Name (Order Name)"
                        placeholder="e.g. Alex"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                    />

                    <Dropdown
                        label="Select Dine-in Table Number"
                        placeholder="Choose your table number..."
                        options={optionsTable}
                        value={selectedTable}
                        setValue={setSelectedTable}
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5 w-full">
                        <Button variant="secondary" size="md" onClick={onClose} className="flex-1 sm:flex-initial">
                            Close
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            disabled={!selectedTable && !customerName}
                            onClick={handleSave}
                            className="flex-1 sm:flex-initial"
                        >
                            Confirm Table
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default TablePickerModal;
