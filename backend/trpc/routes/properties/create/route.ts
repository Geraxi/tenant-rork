import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { Property, PropertyType, PropertyStatus } from "@/types";

export default protectedProcedure
  .input(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    rent: z.number().positive(),
    location: z.string().min(1),
    property_type: z.enum(['apartment', 'house', 'studio', 'shared_room', 'private_room']),
    bedrooms: z.number().min(0),
    bathrooms: z.number().min(0),
    photos: z.array(z.string()).min(1),
    amenities: z.array(z.string()),
    rules: z.array(z.string()),
    available_date: z.string(),
  }))
  .mutation(({ input, ctx }) => {
    const user = ctx.db.users.get(ctx.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.current_mode !== 'landlord') {
      throw new Error('Only landlords can create properties');
    }
    
    const newProperty: Property = {
      id: Math.random().toString(36).substring(2, 11),
      created_by: user.email,
      title: input.title,
      description: input.description,
      rent: input.rent,
      location: input.location,
      property_type: input.property_type as PropertyType,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      photos: input.photos,
      amenities: input.amenities,
      rules: input.rules,
      status: 'available' as PropertyStatus,
      available_date: input.available_date,
    };
    
    ctx.db.properties.set(newProperty.id, newProperty);
    
    return {
      success: true,
      property: newProperty
    };
  });