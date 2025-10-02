import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { mockContracts } from '../create/route';

const signContractSchema = z.object({
  contract_id: z.string(),
  signature_image: z.string(), // base64 encoded signature
});

export const signContractProcedure = protectedProcedure
  .input(signContractSchema)
  .mutation(async ({ input, ctx }) => {
    const now = new Date().toISOString();
    
    // Find the contract
    const contract = mockContracts.find(c => c.id === input.contract_id);
    if (!contract) {
      throw new Error('Contract not found');
    }
    
    // Find the signature for this user
    const signatureIndex = contract.signatures.findIndex(
      sig => sig.user_id === ctx.userId
    );
    
    if (signatureIndex === -1) {
      throw new Error('Signature not found for this user');
    }
    
    // Update the signature
    contract.signatures[signatureIndex] = {
      ...contract.signatures[signatureIndex],
      signature_image: input.signature_image,
      signed_at: now,
      status: 'signed',
    };
    
    // Check if all signatures are complete
    const allSigned = contract.signatures.every(sig => sig.status === 'signed');
    if (allSigned) {
      contract.status = 'finalized';
      contract.pdf_url = `https://example.com/contracts/${contract.id}.pdf`;
      console.log(`Contract ${contract.id} is now finalized`);
      
      // Send notifications to all parties (mock)
      contract.signatures.forEach(sig => {
        console.log(`Notification sent to user ${sig.user_id}: Contract finalized`);
      });
    } else {
      console.log(`Contract ${contract.id} still pending signatures`);
    }
    
    contract.updated_at = now;
    
    console.log(`Contract signed by user ${ctx.userId}`);
    
    return {
      success: true,
      signature: contract.signatures[signatureIndex],
      contract_status: contract.status,
    };
  });