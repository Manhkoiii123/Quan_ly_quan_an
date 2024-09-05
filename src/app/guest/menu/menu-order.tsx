"use client";

import Quantity from "@/app/guest/menu/quantity";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useDishListQuery } from "@/queries/useDish";
import { GuestCreateOrdersBodyType } from "@/schemaValidations/guest.schema";
import Image from "next/image";
import React, { useMemo, useState } from "react";

const MenuOrder = () => {
  const { data } = useDishListQuery();
  const dishes = useMemo(() => {
    return data?.payload.data || [];
  }, [data]);
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([]);
  const totalPrice = useMemo(() => {
    return dishes.reduce((res, acc) => {
      const index = orders.findIndex((order) => order.dishId === acc.id);
      if (index !== -1) {
        return res + acc.price * orders[index].quantity;
      }
      return res;
    }, 0);
  }, [dishes, orders]);
  const handleQuantityChange = (dishId: number, quantity: number) => {
    setOrders((prev) => {
      if (quantity === 0) {
        return prev.filter((order) => order.dishId !== dishId);
      }
      const index = prev.findIndex((order) => order.dishId === dishId);
      if (index === -1) {
        return [...prev, { dishId, quantity }]; // add moi
      }
      const newOrders = [...prev];
      newOrders[index] = { ...newOrders[index], quantity };
      return newOrders;
    });
  };
  return (
    <>
      {dishes.map((dish) => (
        <div key={dish.id} className="flex gap-4">
          <div className="flex-shrink-0">
            <Image
              src={dish.image}
              alt={dish.name}
              height={100}
              width={100}
              quality={100}
              className="object-cover w-[80px] h-[80px] rounded-md"
            />
          </div>
          <div className="space-y-1 max-w-[500px] overflow-hidden">
            <div className="text-sm ">{dish.name}</div>
            <p className="text-xs truncate block w-full">{dish.description}</p>
            <p className="text-xs font-semibold">
              {formatCurrency(dish.price)}
            </p>
          </div>
          <div className="flex-shrink-0 ml-auto flex justify-center items-center gap-2">
            <Quantity
              value={orders.find((o) => o.dishId === dish.id)?.quantity ?? 0}
              onChange={(value) => handleQuantityChange(dish.id, value)}
            />
          </div>
        </div>
      ))}
      <div className="sticky bottom-0">
        <Button className="w-full justify-between">
          <span>Giỏ hàng · {orders.length} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </Button>
      </div>
    </>
  );
};

export default MenuOrder;
