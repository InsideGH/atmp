import { SequelizeNatsPublisher } from '../sequelize-nats-publisher';
import { PatientCreatedEvent, Subjects, internalEventHandler } from '@thelarsson/acss-common';

import db from '../../sequelize/database';
import { models } from '../../sequelize/models';

it('sends a PatientCreatedEvent event to nats', async () => {

});
