
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
};

function read(req, res, next) {
   res.json({ data: res.locals.dish });
   next();
};

function update(req, res, next) {
    const dish = res.locals.dish;
    const { data: { name, description, price, image_url } = {} } = req.body;
    
    const originalName = dish.name;
    const originalDescription = dish.description;
    const originalPrice = dish.price;
    const originalImage = dish.image_url

    if (
        originalName !== name ||
        originalDescription !== description ||
        originalPrice !== price ||
        originalImage !== image_url
    ) {
        dish.name = name;
        dish.description = description;
        dish.price = price;
        dish.image_url = image_url
    }
    res
        .status(200)
        .json({ data: dish })
};

function list(req, res) {
    res.json({ data: dishes })
};

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundId = dishes.find((dish) => dish.id === dishId)
    if (foundId) {
        res.locals.dish = foundId;
        return next();
    }
    next ({
        status: 404,
        message: `Dish does not exist: ${dishId}`
    })
};

function bodyHasNameProperty(req, res, next) {
    const { data: { name } = {} } = req.body;
    if (name) {
        return next();
    }
    next({
        status: 400,
        message: "A 'name' property is required."
    });
};

function bodyHasDescriptionProeprty (req, res, next) {
    const { data: { description } = {} } = req.body;
    if(description) {
        return next();
    }
    next({
        status: 400, 
        message: "A 'description' property is required."
    });
};


function bodyHasPriceProperty (req, res, next) {
    const { data: { price } = {} } = req.body;
    if(price && price > 0 && typeof price === "number") {
        return next();
    }
    next({
        status: 400,
        message: "A 'price' property is required."
    });
};

function bodyHasImageProperty (req, res, next) {
    const { data: { image_url } = {} } = req.body;
    if(image_url) {
        return next();
    }
    next({
        status: 400,
        message: "A 'image_url' property is required."
    });
};

function matchingRoutes(req, res, next) {
    const dishId = res.locals.dish.id;
    const { data: { id } = {} } = req.body;

    if(id) {
        if(id === dishId) {
            return next();
        } else {
            return next({
                status: 400,
                message: `Dish id does not match route id. Dish: ${id}, Route ${dishId}`
            });
        }
    }
    next();
};

module.exports = {
    list,
    create: [bodyHasNameProperty, bodyHasDescriptionProeprty, bodyHasPriceProperty, bodyHasImageProperty, create],
    read: [dishExists, read],
    update: [dishExists, matchingRoutes, bodyHasNameProperty, bodyHasDescriptionProeprty, bodyHasPriceProperty, bodyHasImageProperty, update]
}