import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: String,
      ref: "Movie",
      required: true,
      index: true,
    },

    showDateTime: {
      type: Date,
      required: true,
      index: true,
    },
    showPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    occupiedSeats: {
      type: Object,
      default: {},
    },

    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
      index: true,
    },

    theaterName:    { type: String, default: "" },
    theaterCity:    { type: String, default: "" },
    theaterAddress: { type: String, default: "" },
    theaterLat:     { type: Number, default: 0 },
    theaterLng:     { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Compound unique index: one show per movie + theater + time ──
// This is what lets the same movie + same time exist in
// DIFFERENT theaters but prevents duplicates in the SAME theater.
showSchema.index(
  { movie: 1, theaterId: 1, showDateTime: 1 },
  { unique: true }
);

showSchema.virtual("theater").get(function () {
  return {
    _id: this.theaterId,
    name: this.theaterName,
    city: this.theaterCity,
    address: this.theaterAddress,
    latitude: this.theaterLat,
    longitude: this.theaterLng,
  };
});

export default mongoose.models.Show || mongoose.model("Show", showSchema);