import { helpers} from './utils';
import { AttestationResponse} from 'utils/types';

export async function getAttestationDataFromEASID(
  easID: string
): Promise<AttestationResponse> {
  try {
    const response = await helpers.getAttestationInfoFromAPI(easID);
    if (!Array.isArray(response) || response.length === 0) {
      return { error: true };
    }
    const attestationData = response[0];
    if (helpers.isAttestationData(attestationData)) {
      return { error: false, data: attestationData };
    } else {
      return { error: true };
    }
  } catch (error) {
    console.error('Error fetching attestation data:', error);
    return { error: true };
  }
}
