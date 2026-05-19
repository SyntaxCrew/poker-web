export const numberFormat = (n: number) => new Intl.NumberFormat('en-IN', {maximumFractionDigits: 2}).format(n || 0)

// Possible value of floating point is .25, .5, .75
export const averageFloatingPoint = (n: number) => {
    return Math.round(n * 4) / 4;
}