/* Estado único de la aplicación. */

export const S = {
  step:'inicio', mode:'partido', liga:{teams:3, per:4}, cancha:null,
  players:[], sel:0, raw:'', draft:[], venue:'', alert:'',
  slideIdx:0, cands:[], candIdx:0, view:'lista', editing:false, share:false, copied:'', sound:true, slide:0
};
