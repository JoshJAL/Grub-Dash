const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

const validStatuses = ['pending', 'preparing', 'out-for-delivery', 'delivered'];

function create(req, res, next) {
    const { data: { deliverTo, status, mobileNumber, dishes } } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        status,
        mobileNumber,
        dishes
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

function read(req, res, next) {
    res.json({ data: res.locals.order });
    next();
};

function update(req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const updatedOrder = {
        ...res.locals.order,
        deliverTo, 
        mobileNumber,
        status,
        dishes: [...dishes]
    };
    res.json({ data: updatedOrder });
};

function list(req, res, next) {
    res.json({ data: orders });
};

function destroy(req, res, next) {
    const foundOrder = res.locals.order;
    const index = orders.findIndex((order) => order.id === foundOrder.id);
    if (index > -1) {
        orders.splice(index, 1);
        res.sendStatus(204);
    }
};

function orderExist(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        next();
    }
    next({
        status: 404,
        message: `Order ${orderId} does not exist.`
    });
};

function bodyHasDeliverToProperty(req, res, next) {
    const { deliverTo } = req.body.data;
    if(!deliverTo || deliverTo === '') {
        next({
            status: 400,
            message: `Must include 'deliverTo' property.`
        });
    }
    next();
};

function bodyHasMobileNumberProperty(req, res, next) {
    const { mobileNumber } = req.body.data;
    if (!mobileNumber || mobileNumber === '') {
        next({
            status: 400,
            message: `Must include 'mobileNumber' property.`
        });
    }
    next();
};

function bodyHasDishesProperty(req, res, next) {
    const { dishes } = req.body.data;
    if (!dishes || !Array.isArray(dishes) || !dishes.length) {
        next({
            status: 400,
            message: `Must include 'dishes' property.`
        });
    }
    next();
};

function validQuantity(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    for (let dish of dishes) {
        if (!dish.quantity || typeof dish.quantity !== 'number' || dish.quantity < 1) {
            next({
                status: 400,
                message: `Dish ${dish.id} must have a quantity larger than 0.`
            });
        }
    }
    next();
};

function validStatus(req, res, next) {
    const status = req.body.data.status;
    if (!status || status === '' || !validStatuses.includes(status)) {
        next({
            status: 400,
            message: `Order must have a status of: 'pending', 'preparing', 'out-for-deliver', or 'delivered'.`
        });
    }
    next();
};

function matchingId(req, res, next) {
    const originalId = req.params.orderId;
    const { id } = req.body.data;
    if (id && id !== originalId) {
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${originalId}`
        });
    }
    next();
};

function isPending(req, res, next) {
    const status = res.locals.order.status;
    if (status === 'pending') {
        next();
    }
    next({
        status: 400,
        message: 'An order cannot be deleted unless it has a status of pending.'
    });
};

module.exports = {
    create: [bodyHasDeliverToProperty, bodyHasMobileNumberProperty, bodyHasDishesProperty, validQuantity, create],
    read: [orderExist, read],
    update: [orderExist, bodyHasDeliverToProperty, bodyHasMobileNumberProperty, bodyHasDishesProperty, validQuantity, validStatus, matchingId, update],
    delete: [orderExist, isPending, destroy],
    list,
};