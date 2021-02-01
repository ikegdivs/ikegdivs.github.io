chart = {
    const minX = x(data[0].date);
    const maxX = x(data[data.length - 1].date);
    const overwidth = maxX - minX + margin.left + margin.right;

    const parent = d3.create('div');

    parent.append('svg')
}