import moment from 'moment';

const validatePart = (value, config) => {
    switch (config.type) {
        case 'TEXT':
            return value === config.value;
        case 'DATE':
            return moment(value, config.value, true).isValid();
        case '6_DIGIT_RANDOM':
        case '9_DIGIT_RANDOM':
        case 'SEQUENCE':
            const numberValue = Number(value);
            if (isNaN(numberValue) || !Number.isInteger(numberValue)) {
                return false;
            }
            if (config.type === '6_DIGIT_RANDOM' && value.length !== 6) {
                return false;
            }
            if (config.type === '9_DIGIT_RANDOM' && value.length !== 9) {
                return false;
            }
            return true;
        case '20_BIT_RANDOM':
        case '32_BIT_RANDOM':
            return !isNaN(Number(value));
        case 'GUID':
            const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return guidRegex.test(value);
        default:
            return false;
    }
};

export const validateCustomId = (customId, customIdConfig) => {
    if (!customId || !customIdConfig || customIdConfig.length === 0) {
        return false;
    }

    let cursor = 0;
    for (const part of customIdConfig) {
        let partValue;
        switch (part.type) {
            case 'TEXT':
                const textLength = part.value.length;
                partValue = customId.substring(cursor, cursor + textLength);
                if (partValue !== part.value) return false;
                cursor += textLength;
                break;
            case 'DATE':
                const formatLength = part.value.length;
                partValue = customId.substring(cursor, cursor + formatLength);
                if (!moment(partValue, part.value, true).isValid()) return false;
                cursor += formatLength;
                break;
            case '6_DIGIT_RANDOM':
            case '9_DIGIT_RANDOM':
            case 'SEQUENCE':
                let numLength;
                if (part.type === '6_DIGIT_RANDOM') numLength = 6;
                else if (part.type === '9_DIGIT_RANDOM') numLength = 9;
                else {
                    numLength = 1;
                }
                if (customId.length - cursor < numLength) return false;

                partValue = customId.substring(cursor, cursor + numLength);
                if (isNaN(Number(partValue)) || !Number.isInteger(Number(partValue)) || partValue.length !== numLength) {
                    return false;
                }
                cursor += numLength;
                break;
            case '20_BIT_RANDOM':
            case '32_BIT_RANDOM':
                const numVal = Number(customId.substring(cursor));
                if (isNaN(numVal)) return false;
                cursor = customId.length;
                break;
            case 'GUID':
                const guidLength = 36;
                partValue = customId.substring(cursor, cursor + guidLength);
                const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!guidRegex.test(partValue)) return false;
                cursor += guidLength;
                break;
            default:
                return false;
        }
    }
    return cursor === customId.length;
};