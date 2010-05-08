function draw(ctx, me) {
  ctx.beginPath();

  // clear drawing area
  ctx.clearRect(0,0,500,500);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.fillRect(0,0,500,500);

  // draw me and fill me in
  ctx.rect(me.x,me.y,5,5);

  ctx.fillStyle = '#000000';
  ctx.fill();

  ctx.stroke();

  ctx.closePath();

  setTimeout(function(){draw(ctx, me)}, 25);
}
