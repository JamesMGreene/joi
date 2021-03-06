'use strict';

const Joi = require('./index');

const Messages = require('./messages');


const internals = {};


// Preferences

exports.preferences = Joi.object({
    allowUnknown: Joi.boolean(),
    abortEarly: Joi.boolean(),
    cache: Joi.boolean(),
    context: Joi.object(),
    convert: Joi.boolean(),
    dateFormat: Joi.valid('date', 'iso', 'string', 'time', 'utc'),
    errors: {
        escapeHtml: Joi.boolean(),
        language: [
            Joi.string().invalid(...Object.keys(Messages.errors)),
            Joi.object().ref()
        ],
        wrapArrays: Joi.boolean()
    },
    externals: Joi.boolean(),
    messages: Joi.object(),
    noDefaults: Joi.boolean(),
    nonEnumerables: Joi.boolean(),
    presence: Joi.valid('required', 'optional', 'forbidden'),
    skipFunctions: Joi.boolean(),
    stripUnknown: Joi.object({
        arrays: Joi.boolean(),
        objects: Joi.boolean()
    })
        .or('arrays', 'objects')
        .allow(true, false),
    warnings: Joi.boolean()
})
    .strict();


// Extensions

exports.extension = Joi.object({
    base: [
        Joi.object().schema(),
        Joi.func()
    ],
    name: Joi.string().required(),
    coerce: Joi.func().minArity(1).maxArity(3),
    pre: Joi.func().minArity(1).maxArity(3),
    messages: Joi.object(),
    rules: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        setup: Joi.func().arity(1),
        validate: Joi.func().arity(4),
        params: Joi.object().when('params', {           // Self referencing when() instead of alternatives for better error messages
            is: Joi.object().schema(),
            then: Joi.object().schema('object'),
            otherwise: Joi.object().pattern(/.*/, Joi.object().schema())
        })
    })
        .or('setup', 'validate'))
})
    .strict();


exports.extensions = Joi.array().items(Joi.object(), Joi.func().arity(1)).strict();


// Manifest

internals.desc = () => {

    const func = Joi.object({
        function: Joi.func().required(),
        options: {
            literal: true
        }
    });

    const ref = Joi.object({
        ref: Joi.object({
            path: Joi.array().required(),
            value: Joi.valid('value', 'context', 'local'),
            separator: Joi.string(),
            ancestor: Joi.number().min(0).integer(),
            map: Joi.array().items(Joi.array().length(2)).min(1),
            adjust: Joi.func(),
            iterables: Joi.boolean()
        })
            .required()
    });

    const special = Joi.object({
        special: Joi.valid('deep').required()
    });

    const template = Joi.object({
        template: Joi.string().required(),
        options: Joi.object()
    });

    const value = Joi.object({
        value: Joi.alternatives([Joi.object(), Joi.array()]).required()
    });

    const tries = [

        // Simple

        Joi.boolean(),
        Joi.func(),
        Joi.number(),
        Joi.string(),

        // Object

        func,
        ref,
        special,
        template,
        value,
        Joi.link('/')
    ];

    return Joi.alternatives(tries);
};


exports.description = Joi.object({
    type: Joi.string().required(),
    flags: Joi.object({
        cast: Joi.string(),
        default: internals.desc(),
        description: Joi.string(),
        empty: Joi.link('/'),
        encoding: Joi.string(),
        failover: internals.desc(),
        format: Joi.string().valid('iso', 'javascript', 'unix'),
        id: Joi.string(),
        insensitive: Joi.boolean(),
        label: Joi.string(),
        only: true,
        presence: Joi.string().valid('optional', 'required', 'forbidden'),
        result: Joi.string().valid('raw', 'strip'),
        single: Joi.boolean(),
        sparse: Joi.boolean(),
        strip: Joi.boolean(),
        truncate: Joi.boolean(),
        unit: Joi.string(),
        unknown: true,
        unsafe: Joi.boolean()
    })
})
    .unknown();
