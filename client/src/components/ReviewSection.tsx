import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Review, InsertReview } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReviewSchema } from "@shared/schema";
import { z } from "zod";

interface ReviewSectionProps {
  productId: string;
}

const reviewFormSchema = insertReviewSchema.extend({
  customerName: z.string().min(1, "Name is required"),
  comment: z.string().min(10, "Review must be at least 10 characters"),
  rating: z.number().min(1).max(5),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

export function ReviewSection({ productId }: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const { toast } = useToast();

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews", productId],
        queryFn: () => apiRequest("GET", `/api/reviews?productId=${productId}`),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      productId,
      customerName: "",
      comment: "",
      rating: 0,
    },
  });

  const rating = watch("rating");

  const addReviewMutation = useMutation({
    mutationFn: async (data: InsertReview) => {
      return apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      reset();
      setShowForm(false);
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    addReviewMutation.mutate(data);
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    stars: star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) *
          100
        : 0,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-serif font-bold mb-6">
          Customer Reviews
        </h3>

        {/* Rating Summary */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="text-center md:text-left space-y-2">
            <div className="text-5xl font-bold">{avgRating.toFixed(1)}</div>
            <div className="flex justify-center md:justify-start gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= avgRating
                      ? "fill-primary text-primary"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-muted-foreground">
              Based on {reviews.length} reviews
            </p>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-2">
                <span className="text-sm w-12">{dist.stars} star</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12">
                  {dist.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
          data-testid="button-write-review"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      {/* Review Form */}
      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Your Rating *</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue("rating", star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    data-testid={`button-rating-${star}`}
                  >
                    <Star
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-primary text-primary"
                          : "text-muted hover:text-primary"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-sm text-destructive mt-1">
                  {errors.rating.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="customerName">Your Name *</Label>
              <Input
                id="customerName"
                {...register("customerName")}
                placeholder="Enter your name"
                data-testid="input-review-name"
              />
              {errors.customerName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="comment">Your Review *</Label>
              <Textarea
                id="comment"
                {...register("comment")}
                placeholder="Share your experience with this product..."
                rows={4}
                data-testid="textarea-review-comment"
              />
              {errors.comment && (
                <p className="text-sm text-destructive mt-1">
                  {errors.comment.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={addReviewMutation.isPending}
              data-testid="button-submit-review"
            >
              {addReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </Card>
      )}

      <Separator />

      {/* Reviews List */}
      <div className="space-y-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-6" data-testid={`review-${review.id}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-primary text-primary"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="font-semibold">{review.customerName}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <p className="text-muted-foreground">{review.comment}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
