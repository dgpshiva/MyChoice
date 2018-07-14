from sqlalchemy import create_engine
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship


Base = declarative_base()


class Questions(Base):
    __tablename__ = 'questions'

    id = Column(Integer, primary_key=True)
    question = Column(String)
    posted_by = Column(String)

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'question': self.question,
            'posted_by': self.posted_by
        }


class Choices(Base):
    __tablename__ = 'choices'

    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey('questions.id'))
    questions = relationship(Questions)
    choice = Column(String)
    votes = Column(Integer)

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'question_id': self.question_id,
            'choice': self.choice,
            'votes': self.votes
        }


class UserStatus(Base):
    __tablename__ = 'userstatus'

    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey('questions.id'))
    questions = relationship(Questions)
    username = Column(String)

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'question_id': self.question_id,
            'username': self.username
        }


engine = create_engine('postgresql+psycopg2://mychoice:mychoice@localhost/mychoice')


Base.metadata.create_all(engine)
