import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { mockProperties } from "@/mocks/properties";

export default publicProcedure
  .input(z.object({
    location: z.string().optional(),
    minRent: z.number().optional(),
    maxRent: z.number().optional(),
    propertyType: z.string().optional(),
    bedrooms: z.number().optional(),
  }))
  .query(({ input, ctx }) => {
    // Get properties from database (fallback to mock data if empty)
    let properties = Array.from(ctx.db.properties.values());
    
    // If no properties in database, use mock data
    if (properties.length === 0) {
      properties = mockProperties;
      // Store mock data in database for future use
      mockProperties.forEach(property => {
        ctx.db.properties.set(property.id, property);
      });
    }
    
    // Apply filters
    let filteredProperties = properties.filter(property => property.status === 'available');
    
    if (input.location) {
      filteredProperties = filteredProperties.filter(p => 
        p.location.toLowerCase().includes(input.location!.toLowerCase())
      );
    }
    
    if (input.minRent !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.rent >= input.minRent!);
    }
    
    if (input.maxRent !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.rent <= input.maxRent!);
    }
    
    if (input.propertyType) {
      filteredProperties = filteredProperties.filter(p => p.property_type === input.propertyType);
    }
    
    if (input.bedrooms !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.bedrooms === input.bedrooms);
    }
    
    return {
      success: true,
      properties: filteredProperties
    };
  });