export function getColorFromGradientRGB(index, length) {
    // if (index==0) return `transparent`
    const normalizedIndex = 1 - index / (length - 1);
    const red = Math.round(255 * (1 - normalizedIndex));
    const blue = Math.round(255 * normalizedIndex);
    const green = 0
    const opacity = (1-normalizedIndex)
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

export const getColorFromGradient = (value, max) => {
    if (max === 0 || value === 0) return '#ffffff';

    const ratio = Math.min(value / max, 1);

    const r = 255;
    const g = Math.round(255 - (105 * ratio));
    const b = Math.round(255 - (105 * ratio));

    return `rgb(${r}, ${g}, ${b})`;
};